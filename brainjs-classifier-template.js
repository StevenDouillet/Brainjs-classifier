
const brain = require('brainjs');
const readline = require('readline');
const fs = require('fs');

/**
 * Récupère les données CSV à partir d'un fichier local ou d'une URL (à choisir pour le TP)
 * @param urlOrFilename
 * @returns csvData
 */
function getCsvData(urlOrFilename) {
    return fs.readFileSync(urlOrFilename,'utf8');
}

/**
 * Traite les données  CSV pour avoir des données sous forme de tableau JavaScript
 * @param csvData
 * @param delimiter
 * @returns rawData
 */
function parseCsv(csvData, delimiter) {
    const headers = csvData.slice(0, csvData.indexOf("\n")).split(delimiter);
    const rows = csvData.slice(csvData.indexOf("\n") + 1).split("\n");

    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    return arr;
}

/**
 * Prépare le jeu de données d'entraînement au format Brain.js
 * @param rawData
 * @returns trainingData
 */
function prepareTrainingData(rawData) {
    let trainingData = [rawData.size];

    rawData.forEach((row, index) => {
        row['sepal.length'] = parseFloat(row['sepal.length']);
        row['sepal.width'] = parseFloat(row['sepal.width']);
        row['petal.length'] = parseFloat(row['petal.length']);
        row['petal.width'] = parseFloat(row['petal.width']);

        if(row['variety'] === 'Setosa') {
            row['iris-setosa'] = 1;
            row['iris-versicolor'] = 0;
            row['iris-virginica'] = 0;
        } else if (row['variety'] === 'Versicolor') {
            row['iris-setosa'] = 0;
            row['iris-versicolor'] = 1;
            row['iris-virginica'] = 0;
        } else if (row['variety'] === 'Virginica') {
            row['iris-setosa'] = 0;
            row['iris-versicolor'] = 0;
            row['iris-virginica'] = 1;
        } else {
            row['iris-setosa'] = 0;
            row['iris-versicolor'] = 0;
            row['iris-virginica'] = 0;
        }

        trainingData[index] = {
            'input': [row['sepal.length'], row['sepal.width'], row['petal.length'], row['petal.width']],
            'output': [row['iris-setosa'], row['iris-versicolor'], row['iris-virginica']]
        }
    });

    return trainingData;
}

/**
 * Fonction principale du script
 */
function main() {
    const csvData = getCsvData('./iris.csv');
    // console.log(csvData);

    const parsedData = parseCsv(csvData, ",");
    // console.log(parsedData);

    const trainingData = prepareTrainingData(parsedData);
    // console.log(trainingData);

    let net = new brain.NeuralNetwork({
        binaryThresh: 0.5,
        hiddenLayers: [3, 3, 2],
        activation: "sigmoid",
    });

    net.train(trainingData, {
        iterations: 1000,
        learningRate: 0.3,
    });

    console.log(Array.from(net.run([5.1, 3.5, 1.4, 0.2])));
}

main();
