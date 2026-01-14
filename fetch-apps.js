// Temporary script to fetch apps from Firebase
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: "gamersadmin-f1657",
};

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: serviceAccount.projectId
});

const db = admin.firestore();

async function fetchApps() {
  try {
    const snapshot = await db.collection('apps').get();
    
    if (snapshot.empty) {
      console.log('No apps found in Firebase');
      return;
    }

    console.log('\n=== Apps in Firebase ===\n');
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`App ID: ${data.appId}`);
      console.log(`Name: ${data.name}`);
      console.log(`URL: ${data.url}`);
      console.log(`Image: ${data.image}`);
      console.log(`Description: ${data.description}`);
      console.log('---\n');
    });
  } catch (error) {
    console.error('Error fetching apps:', error.message);
  }
  
  process.exit(0);
}

fetchApps();
