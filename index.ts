import cryto from 'crypto';

class Transaction {
  public amount: number;
  public payer: number | string;
  public payee: number | string;
  constructor(amount: number, payer: number | string, payee: number | string) {
    this.amount = amount;
    this.payer = payer;
    this.payee = payee;
  }

  tostring() {
    return JSON.stringify(this);
  }
}


class Block {
  public prevHash: string | null;
  public transaction: Transaction;
  public ts = Date.now();
  public nonce = Math.round(Math.random() * 999999999)
  constructor(prevHash: string | null, transaction: Transaction) {
    this.prevHash = prevHash;
    this.transaction = transaction;
  }

  get hash() {
    const str = JSON.stringify(this);
    const hash = cryto.createHash('SHA256').update(str).digest('hex');
    return hash;
  }

}


class Chain {
  // @ts-ignore
  public static instance = new Chain();
  chain: Block[];

  constructor(chain: Block[]) {
    // the genesis block
    this.chain = [new Block(null, new Transaction(100, 12345, 12345))];
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  mine(nonce: number) {
    let solution = 1
    console.log('*** mining ***');

    while (true) {
      
      const hash = cryto.createHash('MD5').update((nonce + solution).toString())
      const attempt = hash.digest('hex')

      if (attempt.substr(0, 4) === '0000') {
        console.log('Solved ...', solution);
        return solution
      }
      solution += 1
    }
    
  }

  addBlock(transaction: Transaction, senderPublicKey: string, signature: Buffer) {
    const verifier = cryto.createVerify('SHA256').update(transaction.tostring());

    const isValid = verifier.verify(senderPublicKey, signature);

    if (isValid) {
      const newBlock = new Block(this.lastBlock.hash, transaction);
      this.mine(newBlock.nonce)
      this.chain.push(newBlock);
    }
  }
}


class Wallet {
  public publicKey: string;
  private privateKey: string;

  constructor() {
    const keyPair = cryto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    this.publicKey = keyPair.publicKey;
    this.privateKey = keyPair.privateKey;
  }

  sendMoney(amount: number, payeePublicKey: string) {
    const transaction = new Transaction(amount, this.publicKey, payeePublicKey);

    const sign = cryto.createSign('SHA256').update(transaction.tostring());

    const signature = sign.sign(this.privateKey);

    Chain.instance.addBlock(transaction, this.publicKey, signature);
  }
}

// example
const charlie = new Wallet()
const charles = new Wallet()
const gozie = new Wallet()

charlie.sendMoney(20, charles.publicKey)
gozie.sendMoney(20, charles.publicKey)

console.log(Chain.instance);
