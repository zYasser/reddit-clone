import { useEffect, useState } from "react";

export const isServer = () => {
    const [isServer, setIsServer] = useState(true);
    useEffect(() => setIsServer(false), []);
    return isServer;
};
