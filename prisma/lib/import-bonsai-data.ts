import type { PrismaClient } from '../../generated/prisma/client';

type BonsaiEventInput = {
  id: string;
  description: string;
  date: string;
  value?: number;
  cost?: number;
};

type BonsaiPhotoInput = {
  id: string;
  url: string;
  fileName?: string;
  fileSize?: number | null;
  contentType?: string;
  uploadedAt: string;
  takenAt?: string;
  width?: number;
  height?: number;
  source?: string;
  storagePath?: string;
};

export type BonsaiTreeInput = {
  id: string;
  name: string;
  species: string;
  initialCost: number;
  acquisitionDate: string;
  status: 'active' | 'expired';
  type: 'purchased' | 'collected' | 'field';
  location?: string;
  potType?: string;
  age?: number;
  notes?: string;
  photos?: BonsaiPhotoInput[];
  events?: BonsaiEventInput[];
};

export async function clearBonsaiData(prisma: PrismaClient) {
  await prisma.bonsaiPhoto.deleteMany();
  await prisma.bonsaiEvent.deleteMany();
  await prisma.bonsaiTree.deleteMany();
  await prisma.repotList.deleteMany();
  await prisma.globalNotes.deleteMany();
}

export async function importBonsaiData(
  prisma: PrismaClient,
  trees: BonsaiTreeInput[],
) {
  for (const tree of trees) {
    await prisma.bonsaiTree.create({
      data: {
        id: tree.id,
        name: tree.name,
        species: tree.species,
        initialCost: tree.initialCost,
        acquisitionDate: new Date(tree.acquisitionDate),
        status: tree.status,
        type: tree.type,
        location: tree.location,
        potType: tree.potType,
        age: tree.age,
        notes: tree.notes,
        events: {
          create: (tree.events ?? []).map((event) => ({
            id: event.id,
            description: event.description,
            date: new Date(event.date),
            value: event.value,
            cost: event.cost ?? 0,
          })),
        },
        photos: {
          create: (tree.photos ?? []).map((photo) => ({
            id: photo.id,
            url: photo.url,
            fileName: photo.fileName,
            fileSize: photo.fileSize ?? undefined,
            contentType: photo.contentType,
            uploadedAt: new Date(photo.uploadedAt),
            takenAt: photo.takenAt ? new Date(photo.takenAt) : undefined,
            width: photo.width,
            height: photo.height,
            source: photo.source,
            storagePath: photo.storagePath,
          })),
        },
      },
    });
  }
}
