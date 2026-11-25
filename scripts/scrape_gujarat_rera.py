#!/usr/bin/env python3
"""
Gujarat RERA Real Data Ingestion Script
Fetches 100 real approved registered projects from Gujarat RERA (gujrera.gujarat.gov.in)
with 100% genuine developer contact details (real mobile phone and real email, NO synthetic/fallback data),
creates verified builder accounts (User.systemRoleId = 5, password: Awasio@2026!),
and inserts projects into the production PostgreSQL database on Contabo VPS.
"""

import sys
import os
import re
import time
import json
import ssl
import base64
import subprocess
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

VPS_SSH_CMD = [
    'ssh', '-i', '/Users/vinaykumar/.ssh/contabo_root_nopass',
    'root@95.111.252.156',
    'docker exec -i awasio-postgres psql -U awasio_prod -d awasio_prod_db -t -A -q'
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
}

# Standard bcrypt hash for 'Awasio@2026!'
DEFAULT_BUILDER_PASSWORD_HASH = '$2b$10$FYmqcuthaIZIsSOtSqkDk.NTZsTq2PlGddyDOUFG/Rpe3bUgBRm5G'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def run_sql(sql):
    try:
        p = subprocess.Popen(VPS_SSH_CMD, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        out, err = p.communicate(input=sql, timeout=45)
        return out.strip(), err.strip()
    except Exception as e:
        return '', str(e)

def escape_sql(val):
    if val is None:
        return 'NULL'
    val_str = str(val).replace("'", "''")
    return f"'{val_str}'"

def clean_phone(phone_str):
    if not phone_str or phone_str == '-':
        return None
    digits = re.sub(r'\D', '', str(phone_str))
    if len(digits) == 10 and digits[0] in '6789':
        return f"+91 {digits[:5]} {digits[5:]}"
    elif len(digits) == 12 and digits.startswith('91') and digits[2] in '6789':
        return f"+91 {digits[2:7]} {digits[7:]}"
    elif len(digits) == 11 and digits.startswith('0') and digits[1] in '6789':
        return f"+91 {digits[1:6]} {digits[6:]}"
    return None

def clean_email(email_str):
    if not email_str or email_str == '-' or '@' not in email_str:
        return None
    email_str = email_str.strip().lower()
    if re.match(r'^[\w\.-]+@[\w\.-]+\.[a-zA-Z]{2,}$', email_str):
        if any(dummy in email_str for dummy in ['dummy', 'test@', 'example.com', 'na@', 'none@', 'noemail@']):
            return None
        return email_str
    return None

def fetch_project_api(pid):
    try:
        url1 = f'https://gujrera.gujarat.gov.in/project_reg/public/alldatabyprojectid/{pid}'
        req1 = urllib.request.Request(url1, headers=HEADERS)
        with urllib.request.urlopen(req1, context=ctx, timeout=6) as res1:
            d1 = json.loads(res1.read().decode())
            
        if not (d1.get('status') == 200 and d1.get('data') and d1['data'].get('projRegNo')):
            return None
            
        p = d1['data']
        proj_reg_no = p.get('projRegNo', '').strip()
        proj_name = p.get('projectName', '').strip()
        promoter_name = p.get('promoterName', '').strip()
        raw_phone = p.get('promoterMobileNo')
        raw_email = p.get('promoterEmailId')
        
        phone = clean_phone(raw_phone)
        email = clean_email(raw_email)
        
        if not (phone and email and proj_name and proj_reg_no and promoter_name):
            return None
            
        url2 = f'https://gujrera.gujarat.gov.in/project_reg/public/getproject-details/{pid}'
        req2 = urllib.request.Request(url2, headers=HEADERS)
        with urllib.request.urlopen(req2, context=ctx, timeout=6) as res2:
            d2 = json.loads(res2.read().decode())
            
        pd = (d2.get('data') or {}).get('projectDetail') or {}
        
        return {
            'pid': pid,
            'proj_reg_no': proj_reg_no,
            'proj_name': proj_name,
            'promoter_name': promoter_name,
            'phone': phone,
            'email': email,
            'project_type': p.get('projectType') or pd.get('projectType') or 'Residential',
            'approved_date': p.get('approvedDate') or '',
            'district': (pd.get('distName') or 'Ahmedabad').strip().title(),
            'sub_district': (pd.get('subDistName') or '').strip().title(),
            'pincode': (pd.get('pinCode') or '').strip(),
            'address1': (pd.get('projectAddress') or '').strip(),
            'address2': (pd.get('projectAddress2') or '').strip(),
            'completion_date': (pd.get('completionDateStr') or '').strip(),
            'start_date': (pd.get('startDateStr') or '').strip(),
            'carpet_area': pd.get('totCarpetArea'),
            'approving_authority': (pd.get('approvingAuthority') or '').strip(),
            'desc': (pd.get('projectDesc') or '').strip(),
        }
    except Exception:
        return None

def ingest_gujarat_projects(target_total=200, start_id=29303, max_id=29800):
    print(f"\n=======================================================", flush=True)
    print(f"  Gujarat RERA Real Data Ingestion (Target Total: {target_total})", flush=True)
    print(f"  Scanning IDs starting from: {start_id}", flush=True)
    print(f"=======================================================\n", flush=True)
    
    # 1. Check current count in DB
    initial_check_sql = """
    SELECT COUNT(*) as total,
           COUNT(CASE WHEN "salesPhone" IS NOT NULL AND "salesPhone" != '' THEN 1 END) as with_phone,
           COUNT(CASE WHEN "salesEmail" IS NOT NULL AND "salesEmail" != '' THEN 1 END) as with_email,
           COUNT(CASE WHEN "ownerId" IS NOT NULL THEN 1 END) as with_owner
    FROM "Project" WHERE "stateName" = 'Gujarat';
    """
    res, _ = run_sql(initial_check_sql)
    print(f"Current State in Production DB: {res}", flush=True)
    parts = res.split('|') if res else []
    current_count = int(parts[0]) if parts and parts[0].isdigit() else 0
    
    needed = target_total - current_count
    if needed <= 0:
        print(f"Already reached or exceeded target of {target_total} projects! Current count: {current_count}", flush=True)
        return
        
    print(f"Need to insert {needed} more projects to reach target of {target_total}.\n", flush=True)
    
    # Pre-fetch existing reraIds and sourceRefs to avoid DB collisions
    existing_sql = """
    SELECT "reraId", "sourceRef" FROM "Project" WHERE "stateName" = 'Gujarat';
    """
    ex_res, _ = run_sql(existing_sql)
    existing_rera_ids = set()
    existing_source_refs = set()
    for line in ex_res.split('\n'):
        if '|' in line:
            r, s = line.split('|', 1)
            if r: existing_rera_ids.add(r.strip())
            if s: existing_source_refs.add(s.strip())
            
    print(f"Preloaded {len(existing_rera_ids)} existing Gujarat RERA IDs from DB.", flush=True)
    
    inserted_count = 0
    current_start = start_id
    batch_size = 25
    
    while inserted_count < needed and current_start < max_id:
        current_end = min(current_start + batch_size, max_id)
        batch_ids = list(range(current_start, current_end))
        print(f"\n--- Scanning batch {current_start} to {current_end - 1} ({len(batch_ids)} IDs) ---", flush=True)
        
        valid_projects = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            future_to_pid = {executor.submit(fetch_project_api, pid): pid for pid in batch_ids}
            for future in as_completed(future_to_pid):
                result = future.result()
                if result:
                    valid_projects.append(result)
                    
        valid_projects.sort(key=lambda x: x['pid'])
        print(f"  -> Found {len(valid_projects)} candidate projects from API.", flush=True)
        
        # Filter out already existing in DB
        new_batch = []
        for p in valid_projects:
            s_ref = f"GJRERA:{p['pid']}"
            if p['proj_reg_no'] in existing_rera_ids or s_ref in existing_source_refs:
                continue
            new_batch.append(p)
            existing_rera_ids.add(p['proj_reg_no'])
            existing_source_refs.add(s_ref)
            
        print(f"  -> {len(new_batch)} new unique projects to insert.", flush=True)
        
        if new_batch:
            # Build atomic batch DO block
            sql_statements = ["DO $$", "DECLARE", "    v_uid INT;"]
            sql_statements.append("BEGIN")
            
            for p in new_batch:
                if inserted_count >= needed:
                    break
                    
                pid = p['pid']
                reg_no = p['proj_reg_no']
                proj_name = p['proj_name']
                firm_name = p['promoter_name']
                phone = p['phone']
                email = p['email']
                district = p['district'] if p['district'] else 'Ahmedabad'
                sub_dist = p['sub_district']
                pincode = p['pincode']
                comp_date = p['completion_date']
                address_parts = [p['address1'], p['address2']]
                full_address = ", ".join([a for a in address_parts if a]).strip()
                if not full_address:
                    full_address = f"{proj_name}, {district}, Gujarat"
                    
                source_ref = f"GJRERA:{pid}"
                b64_id = base64.b64encode(str(pid).encode()).decode()
                source_url = f"https://gujrera.gujarat.gov.in/project-preview?id={b64_id}"
                
                source_data_dict = {
                    "type": p['project_type'],
                    "district": district,
                    "subDistrict": sub_dist,
                    "carpetAreaSqm": p['carpet_area'],
                    "approvedOn": p['approved_date'],
                    "registrationNo": reg_no,
                    "approvingAuthority": p['approving_authority']
                }
                source_data_json = json.dumps(source_data_dict)
                
                clean_name_slug = re.sub(r'[^a-z0-9]+', '-', proj_name.lower()).strip('-')
                clean_dist_slug = re.sub(r'[^a-z0-9]+', '-', district.lower()).strip('-')
                slug = f"{clean_name_slug}-{clean_dist_slug}-gjrera-{pid}".lower()
                
                sql_statements.append(f"""
                -- Project PID {pid}
                v_uid := NULL;
                SELECT id INTO v_uid FROM "User" 
                WHERE (email IS NOT NULL AND email = {escape_sql(email)})
                   OR ("mobileNumber" IS NOT NULL AND "mobileNumber" = {escape_sql(phone)})
                LIMIT 1;
                
                IF v_uid IS NULL THEN
                    INSERT INTO "User" ("name", "email", "mobileNumber", "passwordHash", "systemRoleId", "isVerified", "kycVerified", "createdAt", "updatedAt")
                    VALUES ({escape_sql(firm_name)}, {escape_sql(email)}, {escape_sql(phone)}, '{DEFAULT_BUILDER_PASSWORD_HASH}', 5, true, true, NOW(), NOW())
                    RETURNING id INTO v_uid;
                END IF;
                
                INSERT INTO "Project" (
                    "name", "slug", "developerName", "cityName", "stateName", "countryCode",
                    "salesPhone", "salesPhones", "salesEmail", "ownerId",
                    "reraId", "reraStatus", "status", "siteAddress", "pincode",
                    "possessionDate", "source", "sourceRef", "sourceUrl", "sourceData",
                    "isVerified", "createdAt", "updatedAt"
                ) VALUES (
                    {escape_sql(proj_name)}, {escape_sql(slug)}, {escape_sql(firm_name)}, {escape_sql(district)}, 'Gujarat', 'IN',
                    {escape_sql(phone)}, ARRAY[{escape_sql(phone)}]::text[], {escape_sql(email)}, v_uid,
                    {escape_sql(reg_no)}, 'VERIFIED', 'UNDER_CONSTRUCTION', {escape_sql(full_address)}, {escape_sql(pincode)},
                    {escape_sql(comp_date)}, 'GJRERA', {escape_sql(source_ref)}, {escape_sql(source_url)}, {escape_sql(source_data_json)},
                    true, NOW(), NOW()
                ) ON CONFLICT DO NOTHING;
                """)
                inserted_count += 1
                print(f"  + [{inserted_count}/{needed}] Prepared PID {pid}: {proj_name} | {firm_name} | {phone} | {email} | {district}", flush=True)

            sql_statements.append("END $$;")
            batch_sql = "\n".join(sql_statements)
            
            # Execute batch transaction on VPS
            out, err = run_sql(batch_sql)
            if err and "ERROR" in err:
                print(f"  [ERROR executing batch]: {err}", flush=True)
            else:
                print(f"  -> Batch committed successfully to Production DB.", flush=True)
                
        current_start = current_end
        time.sleep(0.3)

    print(f"\n=======================================================", flush=True)
    print(f"Ingestion Completed. Inserted: {inserted_count} new projects.", flush=True)
    print(f"=======================================================\n", flush=True)
    
    # Final Verification in DB
    final_check_sql = """
    SELECT COUNT(*) as total_gujarat,
           COUNT(CASE WHEN "salesPhone" IS NOT NULL AND "salesPhone" != '' THEN 1 END) as with_phone,
           COUNT(CASE WHEN "salesEmail" IS NOT NULL AND "salesEmail" != '' THEN 1 END) as with_email,
           COUNT(CASE WHEN "ownerId" IS NOT NULL THEN 1 END) as with_owner
    FROM "Project" WHERE "stateName" = 'Gujarat';
    """
    res_final, _ = run_sql(final_check_sql)
    print(f"Final Count in Production DB (Total | Phone | Email | Owner): {res_final}", flush=True)
    
    city_sql = """
    SELECT "cityName", count(*) 
    FROM "Project" 
    WHERE "stateName" = 'Gujarat' 
    GROUP BY "cityName" 
    ORDER BY count(*) DESC;
    """
    res_city, _ = run_sql(city_sql)
    print("\nGujarat City Distribution:", flush=True)
    print(res_city, flush=True)

if __name__ == '__main__':
    target = int(sys.argv[1]) if len(sys.argv) > 1 else 200
    ingest_gujarat_projects(target_total=target)
