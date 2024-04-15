const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

async function streamUrl(url = "", pathName = "", options = {}) {
    if (!options && typeof pathName === "object") {
        options = pathName;
        pathName = "";
    }
    try {
        if (!url || typeof url !== "string")
            throw new Error(`The first argument (url) must be a string`);
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
            ...options
        });
        if (!pathName)
            pathName = uuidv4() + (response.headers["content-type"] ? '.' + getExtFromMimeType(response.headers["content-type"]) : ".noext");
        response.data.path = pathName;
        return response.data;
    }
    catch (err) {
        throw err;
    }
}

function getExtFromMimeType(mimeType) {
    const extMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/bmp': 'bmp'
    };
    return extMap[mimeType] || 'txt';
}

module.exports = {
    config: {
        name: 'carbon',
        version: '1.0.0',
        role: 0,
        hasPermission: 0,
        description: "Create an image with code snippet",
        usage: "{pn} <text> ",
        usages: "{pn} <text> ",
        credits: 'converted_modify_cliff', // owner samir
        cooldown: 5,
        hasPrefix: false,
        aliases: ["carbon", "snipe"],
        cooldowns: 5,
        usePrefix: false,
        commandCategory: "image",
    },

    run: async function ({ api, event, args }) {
        const text = args.join(" ");

        if (!text) {
            return;
        }

        try {
            const API = `https://apis-samir.onrender.com/carbon?code=${encodeURIComponent(text)}&themeNumber=4`;
            const imageStream = await streamUrl(API);
            await api.sendMessage({
                attachment: imageStream
            }, event.threadID);
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 404) {
                await api.sendMessage("Error: Not found", event.threadID);
            } else {
                await api.sendMessage("Error occurred", event.threadID);
            }
        }
    }
};
