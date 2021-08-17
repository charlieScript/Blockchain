"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var Transaction = /** @class */ (function () {
    function Transaction(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    Transaction.prototype.tostring = function () {
        return JSON.stringify(this);
    };
    return Transaction;
}());
var Block = /** @class */ (function () {
    function Block(prevHash, transaction) {
        this.ts = Date.now();
        this.nonce = Math.round(Math.random() * 999999999);
        this.prevHash = prevHash;
        this.transaction = transaction;
    }
    Object.defineProperty(Block.prototype, "hash", {
        get: function () {
            var str = JSON.stringify(this);
            var hash = crypto_1.default.createHash('SHA256').update(str).digest('hex');
            return hash;
        },
        enumerable: false,
        configurable: true
    });
    return Block;
}());
var Chain = /** @class */ (function () {
    function Chain(chain) {
        // the genesis block
        this.chain = [new Block(null, new Transaction(100, 12345, 12345))];
    }
    Object.defineProperty(Chain.prototype, "lastBlock", {
        get: function () {
            return this.chain[this.chain.length - 1];
        },
        enumerable: false,
        configurable: true
    });
    Chain.prototype.mine = function (nonce) {
        var solution = 1;
        console.log('*** mining ***');
        while (true) {
            var hash = crypto_1.default.createHash('MD5').update((nonce + solution).toString());
            var attempt = hash.digest('hex');
            if (attempt.substr(0, 4) === '0000') {
                console.log('Solved ...', solution);
                return solution;
            }
            solution += 1;
        }
    };
    Chain.prototype.addBlock = function (transaction, senderPublicKey, signature) {
        var verifier = crypto_1.default.createVerify('SHA256').update(transaction.tostring());
        var isValid = verifier.verify(senderPublicKey, signature);
        if (isValid) {
            var newBlock = new Block(this.lastBlock.hash, transaction);
            this.mine(newBlock.nonce);
            this.chain.push(newBlock);
        }
    };
    // @ts-ignore
    Chain.instance = new Chain();
    return Chain;
}());
var Wallet = /** @class */ (function () {
    function Wallet() {
        var keyPair = crypto_1.default.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        this.publicKey = keyPair.publicKey;
        this.privateKey = keyPair.privateKey;
    }
    Wallet.prototype.sendMoney = function (amount, payeePublicKey) {
        var transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        var sign = crypto_1.default.createSign('SHA256').update(transaction.tostring());
        var signature = sign.sign(this.privateKey);
        Chain.instance.addBlock(transaction, this.publicKey, signature);
    };
    return Wallet;
}());
// example
var charlie = new Wallet();
var charles = new Wallet();
var gozie = new Wallet();
charlie.sendMoney(20, charles.publicKey);
gozie.sendMoney(20, charles.publicKey);
console.log(Chain.instance);
