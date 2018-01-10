const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const storage = firebase.storage();
const database = firebase.database();
const loginButtonEl = document.querySelector('.btn-login');
const fileInputEl = document.querySelector('.file-input');


loginButtonEl.addEventListener('click', async e => {
    // result : 로그인정보를 담은 객체(token, username, email...)
    const result = await auth.signInWithPopup(provider);
    console.log(result);
})

fileInputEl.addEventListener('change', async e => { //change 이벤트: 요소의 값이 변경될 때 발생
    console.log(fileInputEl.files); // .files : 파일리스트를 보여주는 HTMLInputElement의 속성

    const files = Array.from(fileInputEl.files);
    const ps = files.map(async (f, i) => {
        const refStr = `/images/${auth.currentUser.uid}:${new Date().getTime()}:${i}`; // 파일이름이 같으면 충돌우려가 있기때문에, 매번 업로드 할때마다 고유한 이름 refStr로 ref를 새로생성해주는게 좋다 | 경로(images/) + 고유이름(uid:epochtime) | 에포크타임 : UTC기준 초시간
        const snapshot = await storage.ref(refStr).put(f); //snapshot:올라간파일정보 | .ref() : represents a specific location in your Database. 읽고/쓸수 있음
        return database.ref(`/images`).push({ //모두가 공유할 서비스기 때문에, uid로 경로저장하지 않는다
            downloadURL: snapshot.downloadURL,
            filename: f.name
        })
    });
    await Promise.all(ps);
    refreshImages();
})

async function refreshImages() {

    // 1. 실시간 데이터베이스에서 이미지 정보가져오기
    const snapshot = await database.ref(`/images`).once('value');
    const imagesObj = snapshot.val();
    console.log(imagesObj);
    // 2. 각 이미지를 화면에 띄워주기
    if (imagesObj != null) {
        for (let img of Object.values(imagesObj)) {
            const imageBox = document.createElement('div');
            const imageEl = document.createElement('img');
            const imageName = document.createElement('a');
            imageEl.src = img.downloadURL;
            imageName.innerHTML = img.filename;
            imageName.href = img.downloadURL;

            document.body.appendChild(imageBox);
            imageBox.appendChild(imageEl);
            imageBox.appendChild(imageName);
        }
    }
    
}

// 로그인이 되었을때 사용자 데이터 가져오기
auth.onAuthStateChanged(function (user) {
    if (user) {
        refreshImages();
    } else {

    }
});

