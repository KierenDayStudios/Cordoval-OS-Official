async function test() {
  const res = await fetch('https://cordoval.work');
  console.log([...res.headers.entries()]);
}
test();
