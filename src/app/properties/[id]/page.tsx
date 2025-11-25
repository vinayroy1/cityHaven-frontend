import React from 'react';

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <main className="container mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-2xl font-semibold">Property Detail</h1>
      <p className="mt-3 text-gray-700">Property ID: {id}</p>
    </main>
  );
}
