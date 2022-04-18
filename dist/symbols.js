GetSymbol(struct)
{
    if (struct == undefined)
    {
        return "?";
    }
    if (struct instanceof Structure || struct instanceof ConstructionSite)
    {
        switch (struct.structureType)
        {
            case STRUCTURE_SPAWN:
                return "🔘";
            case STRUCTURE_EXTENSION:
                return "⚪";
            case STRUCTURE_CONTAINER:
                return "🛢";
            case STRUCTURE_RAMPART:
                return "🟢";
            case STRUCTURE_WALL:
                return "🧱";
            case STRUCTURE_ROAD:
                return "🚗";
            case STRUCTURE_STORAGE:
                return "🔋";
            case STRUCTURE_TOWER:
                return "🔫";
            case STRUCTURE_LAB:
                return "🧪";
            case STRUCTURE_LINK:
                return "💠";
            case STRUCTURE_TERMINAL:
                return "💲";
            case STRUCTURE_NUKER:
                return "☢";
            case STRUCTURE_POWER_SPAWN:
                return "⭕";
            case STRUCTURE_FACTORY:
                return "🏭";
        }
    }
    if (struct instanceof Tombstone)
    {
        return "💀";
    }
    if (struct instanceof Resource)
    {
        return "🟡";
    }
    if (struct instanceof Ruin)
    {
        return "🗿";
    }
    return "?";
}