const LEVELS = { info: '✔', warn: '⚠', error: '✖', debug: '●' };
const COLORS = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m', debug: '\x1b[35m' };
const RESET  = '\x1b[0m';

function log(level, message) {
    const ts = new Date().toISOString();
    const icon = LEVELS[level] ?? '?';
    const color = COLORS[level] ?? '';
    const shard = process.env.SHARDING_MANAGER_MODE === 'worker' ? `[Shard ${process.env.SHARD_ID ?? '?'}] ` : '';
    console.log(`${color}${icon} ${ts} ${shard}[${level.toUpperCase()}] ${message}${RESET}`);
}

const logger = {
    info: (msg) => log('info', msg),
    warn: (msg) => log('warn', msg),
    error: (msg) => log('error', msg),
    debug: (msg) => log('debug', msg),
};

export default logger;