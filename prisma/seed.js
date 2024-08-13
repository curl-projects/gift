import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
async function main() {
  console.log("SEEDED")
  const andre = await prisma.user.upsert({
    where: { uniqueName: 'andre-vacha' },
    update: {},
    create: {
      uniqueName: "andre-vacha",
      name: 'Andre Vacha',
      concepts: {
        create: [
          {
            title: 'Interactive Design',
            description: 'Description for Concept 1',
            excerpts: {
              create: [
                {
                  content: 'Excerpt 1 for Concept 1',
                  media: {
                    create: {
                      type: 'image',
                      url: 'https://example.com/image1.jpg',
                    },
                  },
                },
                {
                  content: 'Excerpt 1 for Concept 1',
                  media: {
                    create: {
                      type: 'image',
                      url: 'https://example.com/image1.jpg',
                    },
                  },
                },
                {
                  content: 'Excerpt 1 for Concept 1',
                  media: {
                    create: {
                      type: 'image',
                      url: 'https://example.com/image1.jpg',
                    },
                  },
                },
                {
                  content: 'Excerpt 1 for Concept 1',
                  media: {
                    create: {
                      type: 'image',
                      url: 'https://example.com/image1.jpg',
                    },
                  },
                },
              ],
            },
          },
          {
            title: 'Decentralized Science',
            description: 'Description for Concept 2',
            excerpts: {
              create: [
                {
                  content: 'Excerpt 1 for Concept 2',
                  media: {
                    create: {
                      type: 'video',
                      url: 'https://example.com/video1.mp4',
                    },
                  },
                },
              ],
            },
          },
          {
            title: 'Media Theory',
            description: 'Description for Concept 3',
            excerpts: {
              create: [
                {
                  content: 'Excerpt 1 for Concept 3',
                  media: {
                    create: {
                      type: 'audio',
                      url: 'https://example.com/audio1.mp3',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: {
      concepts: true, // Include created concepts to link them later
    },
  });

  // Extract concept IDs
  const [concept1, concept2, concept3] = andre.concepts;

  // Create links between the concepts
  await prisma.conceptLink.createMany({
    data: [
      { linkedStartId: concept1.id, linkedEndId: concept2.id }, // Concept 1 -> Concept 2
      { linkedStartId: concept2.id, linkedEndId: concept3.id }, // Concept 2 -> Concept 3
      { linkedStartId: concept3.id, linkedEndId: concept1.id }, // Concept 3 -> Concept 1
    ],
  });

  console.log({ andre });

  return andre
}

main()
  .then(async () => {
    console.log("FINISHED MAIN")
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
