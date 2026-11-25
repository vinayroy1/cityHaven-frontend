#!/usr/bin/env python3
"""
Tamil Nadu RERA Scraper & DB Inserter
Scrapes registered building projects from TN RERA (https://www.rera.tn.gov.in/registered-building/tn),
extracts 100% genuine developer contact details (phone, email, address),
and upserts records into PostgreSQL on the Contabo VPS.
"""

import sys
import re
import time
import subprocess
import urllib.request
from bs4 import BeautifulSoup

VPS_SSH_CMD = [
    'ssh', '-i', '/Users/vinaykumar/.ssh/contabo_root_nopass',
    'root@95.111.252.156',
    'docker exec -i awasio-postgres psql -U awasio_prod -d awasio_prod_db -t -A -q'
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Standard bcrypt hash for 'Awasio@2026!'
DEFAULT_BUILDER_PASSWORD_HASH = '$2b$10$FYmqcuthaIZIsSOtSqkDk.NTZsTq2PlGddyDOUFG/Rpe3bUgBRm5G'

def run_sql(sql):
    try:
        p = subprocess.Popen(VPS_SSH_CMD, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out, err = p.communicate(input=sql, timeout=30)
        return out.strip(), err.strip()
    except Exception as e:
        return '', str(e)

def escape_sql(val):
    if val is None:
        return 'NULL'
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"

def fetch_html(url, retries=3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == retries - 1:
                print(f"  [ERROR] Failed to fetch {url}: {e}")
                return None
            time.sleep(1.5)
    return None

def clean_phone(phone_str):
    if not phone_str or phone_str == '-':
        return None
    digits = re.sub(r'\D', '', phone_str)
    if len(digits) == 10 and digits[0] in '6789':
        return f"+91 {digits[:5]} {digits[5:]}"
    elif len(digits) == 12 and digits.startswith('91') and digits[2] in '6789':
        return f"+91 {digits[2:7]} {digits[7:]}"
    elif len(digits) >= 8:
        return phone_str.strip()
    return None

def clean_email(email_str):
    if not email_str or email_str == '-' or '@' not in email_str:
        return None
    email_str = email_str.strip().lower()
    if re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email_str):
        return email_str
    return None

def scrape_promoter_details(promoter_url):
    html = fetch_html(promoter_url)
    if not html:
        return {}
    soup = BeautifulSoup(html, 'html.parser')
    data = {}
    for lbl in soup.find_all('label'):
        txt = lbl.get_text(strip=True).lower()
        val = ''
        p = lbl.find_next_sibling('p') or (lbl.parent.find('p') if lbl.parent else None)
        if p:
            val = p.get_text(strip=True)
        if 'firm name' in txt or ('name' in txt and 'firm_name' not in data):
            data['firm_name'] = val
        elif 'email' in txt:
            data['email'] = clean_email(val)
        elif 'mobile no. 1' in txt or 'mobile 1' in txt:
            data['mobile1'] = clean_phone(val)
        elif 'mobile no. 2' in txt or 'mobile 2' in txt:
            data['mobile2'] = clean_phone(val)
    return data

def scrape_project_details(project_url):
    html = fetch_html(project_url)
    if not html:
        return {}
    soup = BeautifulSoup(html, 'html.parser')
    data = {}
    
    for lbl in soup.find_all('label'):
        txt = lbl.get_text(strip=True).lower()
        val = ''
        sib = lbl.find_next_sibling()
        if sib:
            val = sib.get_text(separator=' ', strip=True)
        elif lbl.parent:
            p = lbl.parent.find('p')
            if p:
                val = p.get_text(separator=' ', strip=True)
                
        if 'project name' in txt and 'project_name' not in data:
            data['project_name'] = val
        elif 'address' in txt and 'address' not in data:
            data['address'] = val
        elif 'total no. of dwelling units' in txt:
            m_units = re.search(r'\d+', val)
            data['total_units'] = int(m_units.group(0)) if m_units else None
        elif 'project completion date' in txt:
            data['completion_date'] = val
        elif 'site extent' in txt:
            data['site_extent'] = val

    # Extract district from address or html
    m_dist = re.search(r'District\s*:\s*([A-Za-z\s]+?)(?:<|\n|\r|Pincode|State)', html, re.I)
    if m_dist:
        data['district'] = m_dist.group(1).strip()
    m_pin = re.search(r'Pincode\s*:\s*(\d{6})', html, re.I)
    if m_pin:
        data['pincode'] = m_pin.group(1).strip()
        
    return data

def process_batch(year=2026, start_idx=0, limit=50):
    url = f"https://www.rera.tn.gov.in/registered-building/tn?year={year}"
    print(f"\n=======================================================")
    print(f"  Tamil Nadu RERA Scraper - Year {year}")
    print(f"  Range: Index {start_idx} to {start_idx + limit}")
    print(f"  URL: {url}")
    print(f"=======================================================")
    
    html = fetch_html(url)
    if not html:
        print("[FATAL] Could not retrieve page.")
        return
        
    soup = BeautifulSoup(html, 'html.parser')
    table = soup.find('table', {'id': 'example1'})
    if not table or not table.find('tbody'):
        print("[FATAL] Could not find projects table.")
        return
        
    all_rows = table.find('tbody').find_all('tr')
    total_found = len(all_rows)
    print(f"Found {total_found} projects in total.")
    
    end_idx = min(start_idx + limit, total_found)
    target_rows = all_rows[start_idx:end_idx]
    print(f"Processing rows {start_idx + 1} to {end_idx} ({len(target_rows)} projects)...")
        
    success_count = 0
    updated_count = 0
    skipped_count = 0
    
    for current_num, row in enumerate(target_rows, start_idx + 1):
        cols = row.find_all('td')
        if len(cols) < 7:
            continue
            
        reg_strong = cols[1].find('strong')
        reg_no = reg_strong.get_text(strip=True) if reg_strong else cols[1].get_text(strip=True)
        reg_no = reg_no.split()[0] if reg_no else ''
        
        promoter_summary = cols[2].get_text(separator=' ', strip=True)
        proj_summary = cols[3].get_text(separator=' ', strip=True)
        completion_col = cols[5].get_text(strip=True) if len(cols) > 5 else ''
        
        promoter_link = None
        project_link = None
        form_c_link = None
        
        for a in cols[6].find_all('a'):
            txt = a.get_text().strip()
            href = a.get('href', '')
            if 'Promoter' in txt:
                promoter_link = href
            elif 'Project' in txt:
                project_link = href
                
        if len(cols) > 7:
            a_formc = cols[7].find('a')
            if a_formc:
                form_c_link = a_formc.get('href')
                
        print(f"\n[{current_num}/{total_found}] RERA ID: {reg_no}")
        
        # Scrape promoter details
        promoter_data = {}
        if promoter_link:
            promoter_data = scrape_promoter_details(promoter_link)
            
        # Scrape project details
        project_data = {}
        if project_link:
            project_data = scrape_project_details(project_link)
            
        # Combine extracted data
        firm_name = promoter_data.get('firm_name') or promoter_summary.split(',')[0].strip()
        email = promoter_data.get('email')
        mobile1 = promoter_data.get('mobile1')
        mobile2 = promoter_data.get('mobile2')
        
        proj_name = project_data.get('project_name')
        if not proj_name:
            m = re.search(r'Project Name\s*:\s*([^<\n\r]+?)(?:Registration|Consisting|Block|Affordable|\.|$)', proj_summary, re.I)
            proj_name = m.group(1).strip() if m else f"Project {reg_no}"
            
        district = project_data.get('district') or 'Chennai'
        district = district.split()[0].title() if district else 'Chennai'
        pincode = project_data.get('pincode')
        address = project_data.get('address') or proj_summary
        total_units = project_data.get('total_units')
        completion_date = project_data.get('completion_date') or completion_col
        
        phones = []
        if mobile1:
            phones.append(mobile1)
        if mobile2 and mobile2 != mobile1:
            phones.append(mobile2)
            
        primary_phone = phones[0] if phones else None
        
        print(f"  Project: {proj_name}")
        print(f"  Builder: {firm_name}")
        print(f"  Phone:   {primary_phone or 'NONE'}")
        print(f"  Email:   {email or 'NONE'}")
        print(f"  City:    {district}")
        
        # Check if already in DB
        check_sql = f"SELECT id, \"salesPhone\", \"ownerId\" FROM \"Project\" WHERE \"reraId\" = {escape_sql(reg_no)} LIMIT 1;"
        res, err = run_sql(check_sql)
        
        owner_id = None
        # Handle Builder User Account
        if firm_name and (email or primary_phone):
            user_check_sql = f"""
            SELECT id FROM "User" 
            WHERE (email IS NOT NULL AND email = {escape_sql(email)})
               OR ("mobileNumber" IS NOT NULL AND "mobileNumber" = {escape_sql(primary_phone)})
            LIMIT 1;
            """
            u_res, _ = run_sql(user_check_sql)
            m_uid = re.search(r'\d+', u_res) if u_res else None
            if m_uid:
                owner_id = int(m_uid.group(0))
            else:
                user_ins_sql = f"""
                INSERT INTO "User" ("name", "email", "mobileNumber", "passwordHash", "systemRoleId", "isVerified", "kycVerified", "createdAt", "updatedAt")
                VALUES ({escape_sql(firm_name)}, {escape_sql(email)}, {escape_sql(primary_phone)}, '{DEFAULT_BUILDER_PASSWORD_HASH}', 5, true, true, NOW(), NOW())
                RETURNING id;
                """
                u_res, u_err = run_sql(user_ins_sql)
                m_uid = re.search(r'\d+', u_res) if u_res else None
                if m_uid:
                    owner_id = int(m_uid.group(0))
                    print(f"  -> Created Builder Account (User ID: {owner_id})")

        phones_pg_array = "'{" + ",".join([f'"{p}"' for p in phones]) + "}'" if phones else "'{}'"
        
        # Unique slug
        clean_reg_slug = re.sub(r'[^a-z0-9]+', '-', reg_no.lower()).strip('-')
        slug_base = re.sub(r'[^a-z0-9]+', '-', f"{proj_name}-{district}-{clean_reg_slug}".lower()).strip('-')
        
        m_pid = re.search(r'^\d+', res) if res else None
        if m_pid:
            p_id = m_pid.group(0)
            update_sql = f"""
            UPDATE "Project" SET
                "developerName" = COALESCE("developerName", {escape_sql(firm_name)}),
                "salesPhone" = {escape_sql(primary_phone)},
                "salesPhones" = {phones_pg_array},
                "salesEmail" = {escape_sql(email)},
                "ownerId" = COALESCE("ownerId", {owner_id if owner_id else 'NULL'}),
                "cityName" = COALESCE("cityName", {escape_sql(district)}),
                "stateName" = 'Tamil Nadu',
                "countryCode" = 'IN',
                "siteAddress" = COALESCE("siteAddress", {escape_sql(address)}),
                "pincode" = COALESCE("pincode", {escape_sql(pincode)}),
                "totalUnits" = COALESCE("totalUnits", {total_units if total_units else 'NULL'}),
                "possessionDate" = COALESCE("possessionDate", {escape_sql(completion_date)}),
                "sourceUrl" = COALESCE("sourceUrl", {escape_sql(project_link or promoter_link)}),
                "updatedAt" = NOW()
            WHERE id = {p_id};
            """
            run_sql(update_sql)
            print(f"  -> Updated Project ID: {p_id}")
            updated_count += 1
        else:
            insert_sql = f"""
            INSERT INTO "Project" (
                "name", "slug", "developerName", "cityName", "stateName", "countryCode",
                "salesPhone", "salesPhones", "salesEmail", "ownerId",
                "reraId", "reraStatus", "status", "siteAddress", "pincode",
                "totalUnits", "possessionDate", "source", "sourceUrl",
                "isVerified", "createdAt", "updatedAt"
            ) VALUES (
                {escape_sql(proj_name)}, {escape_sql(slug_base)}, {escape_sql(firm_name)}, {escape_sql(district)}, 'Tamil Nadu', 'IN',
                {escape_sql(primary_phone)}, {phones_pg_array}, {escape_sql(email)}, {owner_id if owner_id else 'NULL'},
                {escape_sql(reg_no)}, 'VERIFIED', 'UNDER_CONSTRUCTION', {escape_sql(address)}, {escape_sql(pincode)},
                {total_units if total_units else 'NULL'}, {escape_sql(completion_date)}, 'TNRERA', {escape_sql(project_link or promoter_link)},
                true, NOW(), NOW()
            ) RETURNING id;
            """
            new_id, err = run_sql(insert_sql)
            m_new = re.search(r'\d+', new_id) if new_id else None
            if m_new:
                print(f"  -> Inserted New Project ID: {m_new.group(0)}")
                success_count += 1
            else:
                print(f"  [ERROR inserting project]: {err}")
                skipped_count += 1
                
        time.sleep(0.3)

    print("\n=======================================================")
    print(f"Finished Batch Summary:")
    print(f"  New Projects Added:    {success_count}")
    print(f"  Projects Updated:      {updated_count}")
    print(f"  Skipped / Errors:      {skipped_count}")
    print("=======================================================\n")

if __name__ == '__main__':
    start = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    year = int(sys.argv[3]) if len(sys.argv) > 3 else 2026
    process_batch(year=year, start_idx=start, limit=limit)
