
const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;

const FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID;

export async function obtenerImagenesDrive() {
  const params = new URLSearchParams({
    q: `'${FOLDER_ID}' in parents and trashed = false and mimeType contains 'image/'`,
    fields: 'nextPageToken,files(id,name,mimeType)',
    pageSize: '100',
    orderBy: 'name',
    key: API_KEY
  });

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?${params}`
  );

  if (!response.ok) {
    throw new Error('Error consultando Google Drive');
  }

  const data = await response.json();

  return data.files.map(file => ({
    id: file.id,
    nombre: file.name,
    tipo: file.mimeType,
    url: `https://drive.google.com/uc?export=view&id=${file.id}`
  }));
}
