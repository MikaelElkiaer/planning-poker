let crypto = require('crypto');

class IdGenerator {
  generate(seed?: string, length?: number) : string {
    if (!seed) seed = new Date().toString();
    var id = crypto.createHash('md5').update(seed).digest('hex');
    if (length) id = id.substring(0, length);
    
    return id;
  }
}

export { IdGenerator };
