const moveTo = (x, y) => {
    process.stdout.write(`\x1b[${y};${x}H`);
  }
const createScreenDev = () => {
    return {
        getUint16: () => 0,
        getUint8: () => 0,
        setUint16: (address, data) => {
            const charValue = data & 0x00ff;
            // calculate position, starting at 1 not 0
            const x = (address % 16) + 1;
            const y = Math.floor(address / 16) + 1;
            moveTo(x * 2,y); //+2 for better looking
            const char = String.fromCharCode(charValue);
            process.stdout.write(char);
        }
    }
}

module.exports = createScreenDev;