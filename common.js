const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const storage = firebase.storage();
const database = firebase.database();
const loginButtonEl = document.querySelector('.btn-login');
const fileInputEl = document.querySelector('.file-input');
// const imageListEl = document.querySelector('.image-list');

// 로그인이 되었을때 사용자 데이터 가져오기
auth.onAuthStateChanged(function (user) { //위의 provider 인증인스턴스 생성된 후 동작됨.
    if (user) {
        refreshImages();
    } else {

    }
});

loginButtonEl.addEventListener('click', async e => { 
    // result : 로그인정보를 담은 객체(token, username, email...)
    const result = await auth.signInWithPopup(provider);
    // console.log(result);
})

fileInputEl.addEventListener('change', async e => { //change 이벤트: 요소의 값이 변경될 때 발생
    // console.log(fileInputEl.files); // .files : 파일리스트를 보여주는 HTMLInputElement의 속성

    for(let i = 0; i < fileInputEl.files.length; i++){

        // 1. 업로드한 이미지 화면에 띄워주기
        const refStr = `/images/${auth.currentUser.uid}:${new Date().getTime()}`; // 파일이름이 같으면 충돌우려가 있기때문에, 매번 업로드 할때마다 고유한 이름 refStr로 ref를 새로생성해주는게 좋다 | 경로(images/) + 고유이름(uid:epochtime) | 에포크타임 : UTC기준 초시간
        const snapshot = await storage.ref(refStr).put(fileInputEl.files[i]); //snapshot:올라간파일정보 | .ref() : represents a specific location in your Database. 읽고/쓸수 있음
        const imageEl = document.createElement('img');
        imageEl.src = snapshot.downloadURL;
        document.body.appendChild(imageEl);
        // console.log(snapshot);

        // 2. DB저장
        await database.ref(`/images`).push({ //모두가 공유할 서비스기 때문에, uid로 경로저장하지 않는다
            downloadURL: snapshot.downloadURL,
            filename: fileInputEl.files[i].name
        })

    }
})

async function refreshImages(){

    // 1. 실시간 데이터베이스에서 이미지 정보가져오기
    const snapshot = await database.ref(`/images`).once('value');
    const imageObj = snapshot.val();
    // console.log(imageObj);

    // 2. 각 이미지를 화면에 띄워주기 
    // imageListEl.innerHTML = "";
    if (imageObj != null) { //Null-check로 데이터 없을 경우 대비. 안해주면에서 Object.values(null) -> TypeError: Cannot convert undefined or null to object
        for(let img of Object.values(imageObj)){
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



