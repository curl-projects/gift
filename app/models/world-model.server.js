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
                    excerpts: true
                }
            }
        }
    })

    if (!user) {
        throw new Error(`User with name '${uniqueName}' not found`);
    }

    return user
}