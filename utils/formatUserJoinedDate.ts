export const formatUserJoinedDate = (date: string) => {
    const joinedDate = new Date(date);
    const month = joinedDate.toLocaleString("default", { month: "long" });
    const year = joinedDate.getFullYear();

    return `${month} ${year}`;
};
