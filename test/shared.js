/* eslint-env node */
'use strict';
const {mkdir, readFile, writeFile} = require('fs');
const {join, relative} = require('path');
const rimraf = require('rimraf');
const rreaddir = require('recursive-readdir');
const {asyncArrayMap} = require('@wildpeaks/async');


function sleep(milliseconds){
	return new Promise(resolve => {
		setTimeout(() => {
			resolve();
		}, milliseconds);
	});
}

function createFolder(folder){
	return new Promise(resolve => {
		mkdir(folder, {recursive: true}, () => {
			resolve();
		});
	});
}

function deleteFolder(folder){
	return new Promise(resolve => {
		rimraf(folder, () => {
			resolve();
		});
	});
}


function readFromFile(filepath){
	return new Promise((resolve, reject) => {
		readFile(filepath, 'utf8', (err, contents) => {
			if (err){
				reject(err);
			} else {
				resolve(contents);
			}
		});
	});
}


function writeToFile(filepath, data){
	return new Promise((resolve, reject) => {
		writeFile(filepath, data, err => {
			if (err){
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

async function getFiles(folder){
	const files = await rreaddir(folder);
	return files.map(filepath => relative(folder, filepath).replace(/\\/g, '/'));
}


async function getFilesContents(folder){
	const filepaths = await getFiles(folder);
	const contents = await Promise.all(
		filepaths.map(filepath => readFromFile(join(folder, filepath)))
	);

	const results = {};
	const l = filepaths.length;
	for (let i = 0; i < l; i++){
		results[filepaths[i]] = contents[i];
	}

	return results;
}


module.exports.sleep = sleep;
module.exports.createFolder = createFolder;
module.exports.deleteFolder = deleteFolder;
module.exports.readFromFile = readFromFile;
module.exports.writeToFile = writeToFile;
module.exports.getFiles = getFiles;
module.exports.getFilesContents = getFilesContents;
