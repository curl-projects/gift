import { prisma } from "~/db.server";

export async function getWorlds(){
    const worlds = await prisma.world.findMany();
    return worlds;
}

export async function getWorldContent(uniqueName){

    const user = await prisma.user.findUnique({
        where: { uniqueName: uniqueName },
        include: {
            concepts: {
                include: {
                    excerpts: {
                        include: {
                            media: {
                                include: {
                                    annotations: true,
                                }
                            }
                        }
                    },
                    linkedStart: {
                        include: {
                            linkedStart: true,
                            linkedEnd: true,
                        }
                    },
                    linkedEnd: {
                        include: {
                            linkedEnd: true,
                            linkedStart: true,
                        }
                    }
                }
            }
        }
    })

    if (!user) {
        throw new Error(`User with name '${uniqueName}' not found`);
    }

    return user
}

export async function getJournalEntries(uniqueName){
    const journalEntries = await prisma.media.findMany({
        where: {
            userId: uniqueName,
            // type: "journalPage",
        }
    })
    return journalEntries;
}

export async function saveAnnotation(mediaId, content, fromPos, toPos) {
    const annotation = await prisma.annotation.create({
        data: {
            mediaId: mediaId,
            content: content,
            fromPos: parseInt(fromPos),
            toPos: parseInt(toPos),
        },
    });

    console.log("ANNOTATION:", annotation)

    return annotation;
}


