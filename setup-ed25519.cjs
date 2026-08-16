console.log('[setup-ed25519] Setting up require hook');
const { sha512 } = require('@noble/hashes/sha512');
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  if (id === '@noble/ed25519') {
    console.log('[setup-ed25519] Intercepted require for @noble/ed25519');
    const mod = originalRequire.call(this, id);
    if (!mod.utils.sha512Sync) {
      console.log('[setup-ed25519] Setting sha512Sync');
      mod.utils.sha512Sync = sha512;
    }
    return mod;
  }
  return originalRequire.call(this, id);
};

console.log('[setup-ed25519] Hook installed');