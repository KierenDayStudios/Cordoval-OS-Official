async function test() {
  try {
    const res = await fetch("https://cordoval.work/api/post?id=UUmjmMF7n7V9GNtPUh3b", {
      headers: {
        'User-Agent': 'LinkedInBot/1.0'
      },
      redirect: 'manual'
    });
    console.log("Status:", res.status);
    console.log("Location:", res.headers.get('location'));
  } catch (err) {
    console.error(err);
  }
}
test();
