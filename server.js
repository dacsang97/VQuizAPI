const express = require('express');
const axios = require('axios');
const config = require('./config');
const cors = require('cors');
const app = express();
const _ = require('lodash');

const { QUIZLET_API, CLIENT_ID } = config;

app.use(cors());

function genArr(len) {
    let result = [];
    for(var i =0; i < len; i++) {
        result.push(i);
    }
    return result;
}

function parseData(data) {
    let result = {};
    result = _.pick(data, ['title','created_date', 'modified_date', 'creator'])
    result.creator = data.creator;
    result.list = [];
    data.terms.forEach(function(item){
        const { definition } = item;
        const temp = definition.split("__\n");
        let [question, answers, image] = temp;
        answers = answers.split("\n").filter(function(item){
            return item !== ''
        }).map(function(item){
            return item.substr(2).trim();
        })
        // shuffle answers array
        let l = answers.length;
        let shuffleArr = genArr(l);
        shuffleArr = _.shuffle(shuffleArr);
        let trueAns = shuffleArr.indexOf(item.term.charCodeAt(0)-65);
        shuffleArr = shuffleArr.map(function(item){
            return answers[item];
        })

        // save result
        let data = {};
        data.question = question;
        data.image = image;
        data.answers = shuffleArr;
        data.trueAns = trueAns;
        result.list.push(data);
    })
    result.list = _.shuffle(result.list)
    return result;
}

app.get('/:setId', function(req, res, next) {
    const setId = req.params.setId;
    const url = `${QUIZLET_API}/${setId}?client_id=${CLIENT_ID}`;
    axios.get(url)
        .then(function(response) {
            const result = parseData(response.data);
            res.send(result);
        })
        .catch(function(e){
            console.log(e);
            res.status(404)
                .send({ error: 'Deo tim thay'});
        })
})

app.listen(3000, function(){
    console.log('Listen on port 3000');
});

