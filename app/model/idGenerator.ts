class IdGenerator {
  private _crypto;
  
  constructor(crypto) {
    this._crypto = crypto;
  }

  generate(seed?: string, length?: number) : string {
    if (!seed) seed = new Date().toString();
    var id = this._crypto.createHash('md5').update(seed).digest('hex');
    if (length) id = id.substring(0, length);

    return id;
  }
}

export { IdGenerator };
