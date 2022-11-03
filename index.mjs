import { createClient } from 'redis';
import { RedisMemoryServer } from 'redis-memory-server';

const redisServer = new RedisMemoryServer();
const host = await redisServer.getHost();
const port = await redisServer.getPort();

const client = createClient({
  url: `redis://${host}:${port}`,
});

client.on('error', (err) => console.log('Redis Client Error', err));

await client.connect();

//Все команды Redis https://redis.io/commands/

await client.set('key1', 'value1');
let value = await client.get('key1');
console.log('key1', value); //value1

await client.set('key1', 'value2', {
  EX: 10, //или setEx - удалить через 10 сек
  NX: true, //установить только если НЕ существует
});
value = await client.get('key1');
console.log('key1', value); //value1

await client.set('key2', 'value2', {
  EX: 10, //или setEx - удалить через 10 сек
  XX: true, //установить только если существует
});
value = await client.get('key2');
console.log('key2', value); //null

await client.set('key1', 'value2', {
  EX: 10, //или setEx - удалить через 10 сек
  XX: true, //установить только если существует
});
value = await client.get('key1');
console.log('key1', value); //value2

await client.setNX('key3', 'Hello');
await client.setNX('key3', 'World');
console.log('setNX', await client.get('key3')); //Hello

console.log('getSet', await client.getSet('key3', 'World')); //Hello
console.log('getSet', await client.get('key3')); //World

console.log('mGet', await client.mGet(['key1', 'key2', 'key3'])); //[ 'value2', null, 'World' ]
await client.mSet([
  ['key2', 'Hello'],
  ['key3', 'Redis'],
]);
console.log('mSet', await client.mGet(['key2', 'key3'])); //[ 'Hello', 'Redis' ]
console.log(
  'mSetNX',
  await client.mSetNX([
    ['key2', 'Hello'],
    ['key3', 'World'],
    ['key4', 'value4'],
  ])
); //false
console.log('mSetNX', await client.mGet(['key2', 'key3', 'key4'])); //[ 'Hello', 'Redis', null ]
console.log(
  'mSetNX',
  await client.mSetNX([
    ['key4', 'value4'],
    ['key5', 'value5'],
  ])
); //true
console.log('mSetNX', await client.mGet(['key4', 'key5'])); //[ 'value4', 'value5' ]

await client.setEx('time', 10, 'hello'); //установили 10 сек
console.log('ttl', await client.ttl('time')); //10 сек
await client.expire('time', 5);
console.log('ttl', await client.ttl('time')); //5 сек
await client.expire('time', -1);
console.log('ttl', await client.get('time')); //null

await client.pSetEx('time2', 10 * 1000, 'hello'); //установили 10 сек в милисекундах
console.log('pSetEx', await client.ttl('time2')); //10 сек

await client.set('count', 10);
console.log('incr', await client.incr('count')); //11
console.log('incrBy', await client.incrBy('count', 5)); //16
console.log('decr', await client.decr('count')); //15
console.log('decrBy', await client.decrBy('count', 5)); //10
console.log('incrBy', await client.incrByFloat('count', 1.5)); //11.5

await client.append('hello.world', 'Hello');
await client.append('hello.world', ' World');
console.log('append', await client.get('hello.world')); //Hello World
console.log('exists', await client.exists('hello.world')); //1
console.log('exists', await client.exists('hello')); //0

console.log('==============================================');

// raw Redis commands
await client.HSET('myhash', 'field1', 'value1');
await client.HSET('myhash', 'field2', 'value2');
value = await client.HGETALL('myhash');
console.log('HGETALL', value); //{ field1: 'value1', field2: 'value2' }
console.log('field1', value.field1); //value1
value = await client.HGET('myhash', 'field2');
console.log('field2', value); //value2
value = await client.HKEYS('myhash');
console.log('HKEYS', value); //[ 'field1', 'field2' ]
value = await client.HVALS('myhash');
console.log('HVALS', value); // ['value1', 'value2']
await client.HDEL('myhash', 'field2');
console.log('HEXISTS', await client.HEXISTS('myhash', 'field2')); //false
console.log('HEXISTS', await client.HEXISTS('myhash', 'field1')); //true
console.log('HLEN', await client.HLEN('myhash')); //1

await client.HSETNX('myhash', 'field2', 'Hello');
await client.HSETNX('myhash', 'field2', 'World');
console.log('HSETNX', await client.HGET('myhash', 'field2')); //Hello

await client.HSET('myhash', 'field1', 1);
value = await client.HINCRBY('myhash', 'field1', 5);
console.log('HINCRBY', value); //6
console.log('HINCRBY', await client.HGET('myhash', 'field1')); //6
value = await client.HINCRBYFLOAT('myhash', 'field1', -2.6);
console.log('HINCRBYFLOAT', value); //3.4

console.log('==============================================');

// friendly JavaScript commands
await client.hSet('myhash', 'field1', 'value1');
await client.hSet('myhash', 'field2', 'value2');
value = await client.hGetAll('myhash');
console.log('hGetAll', value); //{ field1: 'value1', field2: 'value2' }
console.log('field1', value.field1); //value1
value = await client.hGet('myhash', 'field2');
console.log('field2', value); //value2
value = await client.hKeys('myhash');
console.log('hKeys', value); //[ 'field1', 'field2' ]
value = await client.hVals('myhash');
console.log('hVals', value); // ['value1', 'value2']
await client.hDel('myhash', 'field2');
console.log('hExists', await client.hExists('myhash', 'field2')); //false
console.log('hExists', await client.hExists('myhash', 'field1')); //true
console.log('hLen', await client.hLen('myhash')); //1

await client.hSetNX('myhash', 'field2', 'Hello');
await client.hSetNX('myhash', 'field2', 'World');
console.log('hSetNX', await client.hGet('myhash', 'field2')); //Hello

await client.hSet('myhash', 'field1', 10);
value = await client.hIncrBy('myhash', 'field1', -5);
console.log('hIncrBy', value); //5
console.log('hIncrBy', await client.HGET('myhash', 'field1')); //5
value = await client.hIncrByFloat('myhash', 'field1', 2.6);
console.log('hIncrByFloat', value); //7.6

console.log('=================Transactions=============================');

// Transactions (Multi/Exec)
await client.set('another-key', 'another-value');
const [setKeyReply, otherKeyValue] = await client
  .multi()
  .set('other-key', 'other-value')
  .get('another-key')
  .exec(); // ['OK', 'another-value']
console.log('Transactions', setKeyReply, otherKeyValue); //'OK', 'another-value'

console.log('===================scanIterator===========================');

// scanIterator
for await (const key of client.scanIterator()) {
  if (key !== 'myhash') {
    console.log('scanIterator', key, await client.get('' + key));
  }
}

for await (const { field, value } of client.hScanIterator('myhash')) {
  console.log('scanIterator', field, value);
}

for await (const key of client.scanIterator({
  //TYPE: 'string',
  MATCH: 'o*',
  COUNT: 100,
})) {
  console.log('scanIterator', key, await client.get('' + key));
}

//Exit
setTimeout(async () => {
  if (client) {
    await client.quit(); //дожидается выполнения начавшихся команд
    //await client.disconnect();//close a client's connection immediately
  }
  if (redisServer) {
    await redisServer.stop();
  }
}, 10 * 1000);
