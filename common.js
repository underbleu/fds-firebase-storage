const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();
const storage = firebase.storage();
const loginButtonEl = document.querySelector('.btn-login');
const fileInputEl = document.querySelector('.file-input');


loginButtonEl.addEventListener('click', async e => { 
    // result : 로그인정보를 담은 객체(token, username, email...)
    const result = await auth.signInWithPopup(provider);
    console.log(result);
})

fileInputEl.addEventListener('change', async e => { //change 이벤트: 요소의 값이 변경될 때 발생


    console.log(fileInputEl.files); // .files : 파일리스트를 보여주는 HTMLInputElement의 속성
    for(let i = 0; i < fileInputEl.files.length; i++){
        // 파일이름이 같으면 충돌우려가 있기때문에, 매번 업로드 할때마다 고유한 이름 refStr로 ref를 새로생성해주는게 좋다
        // 경로(images/) + 고유이름(uid:epochtime) | 에포크타임 : UTC기준 초시간
        const refStr = `/images/${auth.currentUser.uid}:${new Date().getTime()}`; //snapshot:올라간파일정보
        const snapshot = await storage.ref(refStr).put(fileInputEl.files[i]); //.ref() : represents a specific location in your Database. 읽고/쓸수 있음
        const imageEl = document.createElement('img');
        imageEl.src = snapshot.downloadURL;
        document.body.appendChild(imageEl);
    }

})






