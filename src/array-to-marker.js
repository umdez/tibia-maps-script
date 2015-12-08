'use strict';

const windows1252 = require('windows-1252');

const icons = require('./icons.js');

const arrayToMarkerBuffer = function(array) {
	let result = new Buffer(4);
	result.writeUIntLE(array.length, 0x0, 4);
	for (const marker of array) {
		const markerBuffer = new Buffer(14 + marker.description.length);
		markerBuffer.writeUInt8(marker.xPosition, 0x0);
		markerBuffer.writeUInt8(marker.xTile, 0x1);
		markerBuffer.write('\0\0', 0x2, 2, 'utf8');
		markerBuffer.writeUInt8(marker.yPosition, 0x4);
		markerBuffer.writeUInt8(marker.yTile, 0x5);
		markerBuffer.write('\0\0', 0x6, 2, 'utf8');
		const iconByte = icons.byName[marker.icon];
		console.assert(iconByte != null);
		markerBuffer.writeUIntLE(iconByte, 0x8, 4);
		// Marker descriptions are limited to 99 bytes. Since only symbols that can
		// be represented in the windows-1252 encoding may be used, this equals
		// exactly 99 such symbols.
		// When viewed in the client, markers with descriptions exceeding 99 bytes
		// are truncated, and the map file is updated with the truncated marker
		// description.
		console.assert(
			marker.description.length <= 99,
			'Marker description should be 99 symbols or fewer'
		);
		markerBuffer.writeUIntLE(marker.description.length, 0xC, 2);
		markerBuffer.write(
			windows1252.encode(marker.description),
			0xE,
			marker.description.length,
			'binary'
		);
		result = Buffer.concat([result, markerBuffer]);
	}
	return result;
};

module.exports = arrayToMarkerBuffer;
