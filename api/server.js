const express = require("express");

const db = require("../data/dbConfig.js");

const server = express();
const router = express.Router();

server.use(express.json());
server.use('/api/accounts', router);

// GET /api/accounts
router.get('/', (req, res, next) => {
    const {limit=null, sortby='id', sortdir='asc'} = req.query;
    db('accounts')
    .limit(limit)
    .orderBy(sortby, sortdir)
    .then(accounts => {
        res.status(200).json(accounts);
    })
    .catch(err => res.status(500).json({errorMessage: "Failed to get accounts from the database"}));
})

// GET /api/accounts/:id
router.get('/:id', (req, res, next) => {
    const {id} = req.params;
    db('accounts')
    .where({id})
    .first()
    .then(account => {
        if(account.length){
            res.status(200).json(account);
        } else {
            res.status(400).json({message: "Unable to find account with that id"})
        }
    })
    .catch(err => res.status(500).json({errorMessage: "Failed to get accounts from the database"}));
})

// POST /api/accounts
router.post('/', (req, res, next) => {
    if(req.body.name && req.body.budget){
        db('accounts')
        .insert(req.body, "id")
        .then(id => db('accounts').where({id: id[0]}).first())
        .then(account => {
            res.status(200).json(account);
        })
        .catch(err => res.status(500).json({errorMessage: "Failed to add data to database"}))
    } else {
        res.status(404).json({message: "name and budget are required properties"})
    }
})

// PUT /api/accounts/:id
router.put('/:id', (req, res, next) => {
    if(req.body.name || req.body.budget){
        db('accounts')
        .where({id: req.params.id})
        .update(req.body)
        .then(count => {
            if(count){
                db('accounts')
                .where({id: req.params.id})
                .first()
                .then(account => {
                    res.status(200).json(account);
                }) 
                .catch(err => res.status(500).json({errorMessage: "Failed to update account"}));
            } else {
                res.status(400).json({message: "Account not found"})
            }
        })
        .catch(err => res.status(500).json({errorMessage: "Failed to update account"}));
    } else {
        res.status(400).json({message: "Need to include name or budget propert"})
    }
})

// DELETE /api/accounts/:id
router.delete('/:id', (req, res, next) => {
    const {id} = req.params;
    db('accounts')
    .where({id})
    .delete()
    .then(count => {
        if(count){
            res.status(200).json({message: "successfully deleted account"})
        } else {
            res.status(400).json({message: "Account not found"})
        }
    })
    .catch(err => res.status(500).json({errorMessage: "failed to delete account"}))
})

module.exports = server;
