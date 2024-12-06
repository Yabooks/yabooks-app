const logLevels = [
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR"
];

module.exports = function(logLevel = "INFO", messages = [])
{
    const currentLogLevel = logLevels.indexOf(process.env.LOG_LEVEL || "INFO");
    logLevel = logLevels.indexOf(logLevel);

    if(logLevel >= currentLogLevel)
    {
        let write = (logLevel === "ERROR") ? console.error : console.log;
        write(`[${new Date().toLocaleString()}]`, ...messages);
    }
};
