export function formatNameIntoURL(name: string) {
    const regex = /\s/g;
    const newName = name.replace(regex, "-").toLowerCase();

    return newName;
}
