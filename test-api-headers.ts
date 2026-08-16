async function test() {
  const res = await fetch('https://cordoval.work/api/post?id=UUmjmMF7n7V9GNtPUh3b');
  console.log("Status for /api/post:", res.status);
  console.log("Headers for /api/post:", [...res.headers.entries()]);
}
test();
