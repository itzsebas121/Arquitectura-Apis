document.addEventListener('DOMContentLoaded',()=>{
    const imgRest = document.querySelector('#imgRest');
    imgRest.addEventListener('click',()=>{
        window.location.href = '../Client/pages/Rest.html';
    })  
    const imgGraph = document.querySelector('#imgGraph');
    imgGraph.addEventListener('click',()=>{
        window.location.href = '../Client/pages/Graphql.html';
    })  
})