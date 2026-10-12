const firebase = window.firebase;
firebase.initializeApp({
    apiKey: 'AIzaSyDY453ohxvPoizc0BUngVbqblVGAAfsX4Q',
    authDomain: 'mrindia-0.firebaseapp.com',
    databaseURL: 'https://mrindia-0-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'mrindia-0',
    storageBucket: 'mrindia-0.firebasestorage.app',
    messagingSenderId: '829263357469',
    appId: '1:829263357469:web:56e8ff92e299edee83c8f4',
    measurementId: 'G-DM9KX3VTTH'
});
firebase.analytics();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const database = firebase.firestore().collection('IBM_Nasscom_PBEL');
const max_dots = 4;
const faks = document.getElementById('fapiks');
const info = document.getElementById('info-giver');
const typingdots = document.getElementById('typingdotsanimation');
const time_displayer = document.getElementById('time-displayer');
const resultImage = document.getElementById('resultImage');
const historyContainer = document.getElementById('imageHistory');
historyContainer.onclick = hcoce => {
    const arrow = hcoce.target.closest('.download-arrow');
    if (arrow && arrow.dataset.link.startsWith('http')) download_image(arrow.dataset.link, 0);
};
const promptInput = document.getElementById('promptInput');
const apifield = document.getElementById('apis');
document.getElementById('about-the-creator-btn').onclick = () => {
    document.getElementById('popup-overlay').style.display = 'block';
    document.getElementById('about-the-creator').style.display = 'block';
};
document.getElementById('close-creator-info').onclick = () => {
    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('about-the-creator').style.display = 'none';
};
const dbtn = document.getElementById('downloadbtn');
const authToggleBtn = document.getElementById('authToggleBtn');
const genbtn = document.getElementById('generateButton');
const rstbtn = document.getElementById('resetButton');
const userInfo = document.getElementById('userInfo');
const userEmail = document.getElementById('userEmail');
const userName = document.getElementById('userName');
const userPhoto = document.getElementById('userPhoto');
userPhoto.onclick = () => window.open(userPhoto.src, '_blank');
const usercreationtime = document.getElementById('accountcreationtime');
const GenAIForm = document.getElementById('promptForm');
let createdimagesuntilnow = {};
let BackEndRef = null;
let website_used = window.location.href;
let RepeaterID = null;
let DotsID = null;
let siteforapikey = null;
let imggenURL = null;
let imgloadURL = null;
let imgloadapi = null;
let current_user = null;
let current_user_uid = null;
let user_email = null;
let user_photoURL = null;
let user_displayName = null;
let user_phoneNumber = null;
let user_creationTime = null;
let user_lastSignInTime = null;
let user_emailVerified = null;
let user_providerId = null;
let user_isAnonymous = null;
let lastVisit = null;
let lastExit = null;
let is_user_submit_process = false;
const esc = escps => String(escps).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const statusRow = (label, value, lblClass, valClass) => `<span class = 'lbl ${lblClass}'>${label}</span><span class = 'sep'>:</span><span class = 'val ${valClass}'>${value}</span>`;
function assignUserData(user) {
    current_user = user;
    current_user_uid = user?.uid;
    BackEndRef = user && database.doc(user.uid);
    user_email = user?.email;
    user_displayName = user?.displayName;
    user_photoURL = user?.photoURL;
    user_phoneNumber = user?.phoneNumber;
    user_emailVerified = user?.emailVerified;
    user_providerId = user?.providerId;
    user_isAnonymous = user?.isAnonymous;
    user_creationTime = user && formatCustomDate(new Date(user_email === 'myprojectworks100@gmail.com' ? '2025-07-15T17:08:25' : (user.metadata?.creationTime || Date.now())));
    user_lastSignInTime = user && formatCustomDate(new Date(user.metadata?.lastSignInTime || Date.now()));
}
function saveUserDataToFirestore() {
    if (!current_user || !current_user_uid || !BackEndRef) return;
    BackEndRef.update({
        'about_user.name': user_displayName,
        'about_user.email': user_email,
        'about_user.photoURL': user_photoURL,
        'about_user.phoneNumber': user_phoneNumber,
        'about_user.emailVerified': user_emailVerified,
        'about_user.providerId': user_providerId,
        'about_user.isAnonymous': user_isAnonymous,
        'about_user.createdAt': `${user_creationTime}`,
        'about_user.lastSignInAt': `${user_lastSignInTime}`,
        'about_user.lastVisited': `${lastVisit}`,
        'about_user.last_website_used': website_used
    }).catch(error => {
        if (error.message.includes('No document to update')) BackEndRef.set({ user_generated_images: {} }, { merge: true }).then(saveUserDataToFirestore).catch(error0 => alert(`❌ Error creating user document: ${error0}`));
        else alert(`❌ Error saving user credentials: ${error}`);
    });
}
window.onbeforeunload = () => {
    if (!current_user || !current_user_uid || !BackEndRef) return;
    lastExit = formatCustomDate(new Date());
    BackEndRef.update({ 'about_user.lastExit_or_SignOut': `${lastExit}` }).catch(error => alert(`❌ Error saving user credentials: ${error}`));
};
auth.onAuthStateChanged(user => {
    assignUserData(user);
    if (user) {
        authToggleBtn.textContent = 'Sign Out';
        authToggleBtn.onclick = () => {
            if (!current_user || !current_user_uid || !BackEndRef) return;
            lastExit = formatCustomDate(new Date());
            BackEndRef.update({ 'about_user.lastExit_or_SignOut': `${lastExit}` }).catch(error => alert(`❌ Error saving user credentials: ${error}`));
            auth.signOut();
        };
        userInfo.style.display = 'flex';
        userEmail.textContent = user_email || 'No email';
        userName.textContent = user_displayName || 'Anonymous';
        usercreationtime.textContent = user_creationTime;
        userPhoto.src = user_photoURL || 'https://www.gravatar.com/avatar/?d=mp';
        lastVisit = formatCustomDate(new Date());
        lastExit = null;
        retrieve();
    } else {
        authToggleBtn.textContent = 'Sign In';
        userPhoto.src = 'https://www.gravatar.com/avatar/?d=mp';
        userInfo.style.display = 'none';
        userEmail.textContent = '';
        userName.textContent = '';
        usercreationtime.textContent = '';
        historyContainer.innerHTML = `<h2 style = 'color: rgb(40, 40, 160);'>Please sign in to view your generated images history.</h2>`;
        document.body.style.display = 'block';
        authToggleBtn.onclick = () => auth.signInWithPopup(provider).catch(error => alert(`❌ Error signing in user: ${error}`));
        current_user = null;
        current_user_uid = null;
        createdimagesuntilnow = {};
    }
    saveUserDataToFirestore();
    resultImage.style.display = 'none';
    dbtn.style.display = 'none';
    resultImage.src = '';
    resultImage.style.display = 'none';
    promptInput.value = '';
    apifield.value = '';
    info.textContent = '';
    info.style.display = 'none';
    time_displayer.textContent = '';
    time_displayer.style.display = 'none';
    typingdots.textContent = '';
    typingdots.style.display = 'none';
});
function btnsdisable(bool_val) {
    authToggleBtn.disabled = bool_val;
    genbtn.disabled = bool_val;
    rstbtn.disabled = bool_val;
    apifield.disabled = bool_val;
}
function displaytime(starttime) {
    if (starttime) {
        time_displayer.style.display = 'block';
        RepeaterID = setInterval(() => time_displayer.innerHTML = statusRow('Time Elapsed', `${((performance.now() - starttime) / 1000).toFixed(4)} seconds`, 'lbl-time', 'val-time'), 250);
    }
    else {
        time_displayer.style.display = 'none';
        time_displayer.textContent = '';
        if (RepeaterID) {
            clearInterval(RepeaterID);
            RepeaterID = null;
        }
    }
}
function dotsanimation(start_or_stop) {
    let dotCount = 0;
    if (start_or_stop) {
        typingdots.style.display = 'inline';
        DotsID = setInterval(() => {
            dotCount = (dotCount + 1) % (max_dots + 1);
            typingdots.textContent = '.'.repeat(dotCount);
        }, 500);
    }
    else {
        typingdots.style.display = 'none';
        typingdots.textContent = '';
        if (DotsID) {
            clearInterval(DotsID);
            DotsID = null;
        }
    }
}
async function constructpublicsharableurlforimageviewing(image_data, fetch_site, fetch_api, prompt) {
    try {
        const uploadData = new FormData();
        uploadData.append('key', fetch_api);
        uploadData.append('image', image_data);
        const uploadResponse = await fetch(fetch_site, { method: 'POST', body: uploadData });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok || !uploadResult.data?.url) {
            info.textContent = '❌ Generated Image but FAILED TO UPLOAD — showing temporary image! Please Download or Screenshot it otherwise you will LOSE this Image! See console for details!';
            console.error(uploadResponse);
            alert('⚠️ Image upload failed! This Image is temporary and not saved anywhere. Please Download or Screenshot it Immediately.');
            resultImage.src = image_data;
            return image_data;
        }
        return uploadResult.data.url;
    }
    catch (error0) {
        info.textContent = `⚠️ Upload failed: ${error0}. Download or Save this Image before Leaving the page otherwise you will LOSE it! See console for details!`;
        console.error(error0);
        alert('⚠️ Something went wrong while uploading! The image is shown below but not saved. Download or Save it now before Leaving the page otherwise you will LOSE it!');
        resultImage.src = image_data;
        return image_data;
    }
}
async function download_image(download_link, is_main_or_not) {
    try {
        const response = await fetch(download_link);
        if (!response.ok) throw new Error(`Failed to fetch image as Response is NOT OK : ${response}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${(window.location.host + window.location.pathname).replace(/\/+$/, '').replace(/\//g, '_')}, User ${user_displayName || 'Unknown_User'}, On ${formatCustomDate(new Date(), 1)}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        if (is_main_or_not) {
            console.error(error);
            info.innerHTML = statusRow('Error Downloading Image', esc(error), 'lbl-error', 'val-error') + '<br>' + statusRow('Details', 'Check console for details.', 'lbl-hint', 'val-hint');
        }
        else alert(`Error downloading image with link ${download_link} : ${error}! Pls try downloading again later!`);
    }
}
GenAIForm.onsubmit = async gafose => {
    gafose.preventDefault();
    if (is_user_submit_process) return alert('An Image generation is currently in progress. Please wait until the current process completes before submitting the form again.');
    info.textContent = '';
    info.style.display = 'inline';
    if (!current_user || !current_user_uid || !BackEndRef) return info.innerHTML = statusRow('Error', 'User not authenticated. Please sign in to generate images.', 'lbl-error', 'val-error');
    if (!siteforapikey || !imggenURL || !imgloadURL || !imgloadapi) return info.innerHTML = statusRow('Error', `Certain important assets needed for image generation are missing as they failed to load. As a result image generation won't be possible in this session. Please ensure you have a stable connection and reload.`, 'lbl-error', 'val-error');
    btnsdisable(true);
    const startTime = performance.now();
    is_user_submit_process = true;
    const prompt = promptInput.value;
    resultImage.style.display = 'none';
    resultImage.src = '';
    dbtn.style.display = 'none';
    info.innerHTML = statusRow('Creating Image With Prompt', esc(prompt), 'lbl-creating', 'val-prompt');
    displaytime(startTime, 1);
    dotsanimation(1);
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('output_format', 'png');
    try {
        const imggenapi = apifield.value;
        const response = await fetch(imggenURL, { method: 'POST', headers: { 'Authorization': `Bearer ${imggenapi}`, 'Accept': 'application/json' }, body: formData });
        const data = await response.json();
        if (response.ok && data.image) {
            info.innerHTML = statusRow('Loading Image For Prompt', esc(prompt), 'lbl-creating', 'val-prompt');
            const downloadURL = await constructpublicsharableurlforimageviewing(data.image, imgloadURL, imgloadapi);
            resultImage.src = downloadURL;
            resultImage.style.display = 'block';
            is_user_submit_process = false;
            const durationSeconds = ((performance.now() - startTime) / 1000).toFixed(5);
            displaytime();
            dotsanimation();
            const timestamp = new Date();
            dbtn.style.display = 'block';
            dbtn.onclick = () => download_image(downloadURL, 1);
            info.innerHTML = statusRow('Created With Prompt', esc(prompt), 'lbl-created', 'val-prompt') + '<br>' + statusRow('Time Taken', `${durationSeconds} seconds`, 'lbl-time', 'val-time');
            const key = `Prompt #${Object.keys(createdimagesuntilnow).length + 1}`;
            createdimagesuntilnow[key] = { prompt: prompt, link: downloadURL.startsWith('http') ? downloadURL : 'No Image URL', time: durationSeconds, createdAt: formatCustomDate(timestamp) };
            Save_user_generated_Image_to_backend();
        } else {
            displaytime();
            dotsanimation();
            console.error(data);
            info.innerHTML = statusRow('Error In Generating Image', esc(Array.isArray(data.errors) ? data.errors.join(', ') : (data.errors || 'Failed to generate image')), 'lbl-error', 'val-error') + '<br>' + statusRow('Details', 'See console for details.', 'lbl-hint', 'val-hint');
        }
    } catch (error) {
        displaytime();
        dotsanimation();
        console.error(error);
        info.innerHTML = statusRow('Network Error', esc(error || 'Unexpected Issue'), 'lbl-error', 'val-error') + '<br>' + statusRow('Details', 'See console for details.', 'lbl-hint', 'val-hint');
    } finally {
        displaytime();
        dotsanimation();
        btnsdisable(false);
        is_user_submit_process = false;
    }
};
function formatCustomDate(dateObj, is_file_name) {
    const pad = (num) => num.toString().padStart(2, '0');
    const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dateObj.getDay()];
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = pad(dateObj.getMinutes());
    const seconds = pad(dateObj.getSeconds());
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const formattedHours = pad(hours);
    if (is_file_name) return `Date - ${day}-${month}-${year}, Day - ${weekday}, Time - ${formattedHours}-${minutes}-${seconds}${ampm}`;
    return `${day}/${month}/${year}, Day - ${weekday}, ${formattedHours}:${minutes}:${seconds}${ampm}`;
}
function display() {
    try {
        faks.href = siteforapikey;
        if (!current_user || !current_user_uid || !BackEndRef) return historyContainer.innerHTML = `<h2 style = 'color: rgb(40, 40, 160);'>Please sign in to view your generated images history.</h2>`;
        if (!createdimagesuntilnow || Object.keys(createdimagesuntilnow).length === 0) return historyContainer.innerHTML = `<h2 style = 'color: rgb(40, 40, 160);'>No Images Generated Yet</h2>`;
        historyContainer.innerHTML = `<h2 style = 'color: rgb(40, 40, 160);'>History of Generated Images:</h2><p style = 'font-size: 18px; color: rgb(20, 20, 100); font-weight: 500;'>Press the ⬇️ arrow next to each link to download the corresponding image.</p>`;
        const sortedKeys = Object.keys(createdimagesuntilnow).sort((a, b) => parseInt(b.replace(/[^\d]/g, '')) - parseInt(a.replace(/[^\d]/g, '')));
        sortedKeys.forEach(entryKey => {
            const value = createdimagesuntilnow[entryKey];
            historyContainer.innerHTML += `
                <div class = 'image-entry'>
                    <h3 class = 'row-prompt'><span class = 'lbl'>${entryKey}</span><span class = 'sep'>:</span><span class = 'val'>${value.prompt}</span></h3>
                    <h3 class = 'row-link'><span class = 'lbl'>Link</span><span class = 'sep'>:</span><span class = 'val'><a href = '${value.link}' target = '_blank'>${value.link}</a> <span class = 'download-arrow' data-link = '${value.link}' title = 'Download image'>⬇️</span></span></h3>
                    <h3 class = 'row-time'><span class = 'lbl'>Time Taken</span><span class = 'sep'>:</span><span class = 'val'>${value.time} seconds</span></h3>
                    <h3 class = 'row-date'><span class = 'lbl'>Image Generated At</span><span class = 'sep'>:</span><span class = 'val'>${value.createdAt}</span></h3>
                </div>
            `;
        });
    } catch (error) { historyContainer.innerHTML = `<h2 style = 'color: rgb(40, 40, 160);'>Error displaying history : ${error}</h2>`; }
    finally { document.body.style.display = 'block'; promptInput.focus() }
}
function Save_user_generated_Image_to_backend() {
    if (!current_user || !current_user_uid || !BackEndRef) return;
    BackEndRef.set({ user_generated_images: createdimagesuntilnow, user_api_key: apifield.value }, { merge: true })
        .then(display).catch(error => alert(`❌ Error saving user data: ${error}`));
}
function retrieve() {
    if (!current_user || !current_user_uid || !BackEndRef) return;
    BackEndRef.get()
        .then(snap => {
            createdimagesuntilnow = snap.data().user_generated_images || {};
            apifield.value = snap.data().user_api_key || '';
        })
        .catch(error => {
            if (error.message.includes('undefined')) BackEndRef.set({ user_generated_images: {}, user_api_key: '' }, { merge: true })
                .then(retrieve).catch(error0 => alert(`❌ Error creating user document: ${error0}`));
            else alert(`❌ Error fetching user data: ${error}`);
        })
        .finally(() => database.doc('Current_API_Key').get()
            .then(tempsnap => {
                siteforapikey = tempsnap.data().FetchAPIKeySite;
                imggenURL = tempsnap.data().ImageGenAPIsite;
                imgloadURL = tempsnap.data().ImageLoadAPIsite;
                imgloadapi = tempsnap.data().ImageStoreAPI;
            })
            .catch(error1 => alert(`Certain important assets have failed to load due to error : ${error1}. As a result, image generation will not be possible for this session. Please check your internet connection and reload!`))
            .finally(display));
}