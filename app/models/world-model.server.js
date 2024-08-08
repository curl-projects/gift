import { prisma } from "~/db.server";

export async function getWorlds(){
    const worlds = await prisma.world.findMany();
    return worlds;
}