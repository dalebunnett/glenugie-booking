// Test token generation
const sign = (data, secret) => {
  let hash = 0;
  const combined = data + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const generateToken = (secret) => {
  const timestamp = Date.now().toString(36);
  const signature = sign(timestamp, secret);
  return `${timestamp}-${signature}`;
};

const verify = (token, secret) => {
  const [timestamp, signature] = token.split('-');
  const expectedSig = sign(timestamp, secret);
  return signature === expectedSig;
};

const secret = 'Peterhead2026!';
const token = generateToken(secret);
console.log('Generated token:', token);
console.log('Token is valid:', verify(token, secret));
console.log('Token with wrong secret:', verify(token, 'wrong'));
