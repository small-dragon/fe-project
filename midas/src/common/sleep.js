export default async function(timeout){
    return new Promise((resolve)=>{
        setTimeout(function() {
            resolve();
        }, timeout);
    })
}

 