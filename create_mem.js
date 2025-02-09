const createMemory = sizeInBytes => {
    const arrBuf = new ArrayBuffer(sizeInBytes);
    const dataView = new DataView(arrBuf);
    return dataView;
}

module.exports = {
    createMemory,
}