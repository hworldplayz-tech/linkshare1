// pdf-editor-online main.js
(function(){
  // Helpers: load Fabric dynamically (fallback to CDN) and wait for it
  function loadFabric() {
    return new Promise((resolve, reject) => {
      if (window.fabric) return resolve(window.fabric);
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/fabric@4.6.0/dist/fabric.min.js';
      s.onload = () => (window.fabric ? resolve(window.fabric) : reject(new Error('fabric missing after load')));
      s.onerror = () => reject(new Error('Failed to load fabric'));
      document.head.appendChild(s);
    });
  }

  // Shortcuts to DOM
  const pdfInput = document.getElementById('pdfInput');
  const openPdfBtn = document.getElementById('openPdfBtn');
  const pagesList = document.getElementById('pagesList');
  const pageContainer = document.getElementById('pageContainer');
  const insertImageBtn = document.getElementById('insertImageBtn');
  const addTextTool = document.getElementById('addTextTool');
  const drawTool = document.getElementById('drawTool');
  const downloadBtn = document.getElementById('downloadBtn');

  // State
  let pdfDoc = null;
  let fabricLib = null;
  let pages = []; // {pageNumber, viewport, canvasEl, wrapperEl, fabricCanvas}
  let activePageIndex = 0;

  // Wire open button
  openPdfBtn.addEventListener('click', () => pdfInput.click());
  pdfInput.addEventListener('change', handlePdfFile);

  async function handlePdfFile(e){
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const arrayBuf = await file.arrayBuffer();
    await ensureFabric();
    // Load or normalize PDF.js. Try existing window globals first, otherwise fetch from CDNs.
    async function loadPdfJs() {
      const keys = ['pdfjsLib','pdfjs-dist/build/pdf','pdfjs-dist/build/pdf.js','pdfjs-dist','pdfjsDist','PDFJS'];
      function findExisting() {
        for (const k of keys) {
          if (window[k]) return window[k];
        }
        return null;
      }

      let lib = findExisting();
      if (lib) {
        window.pdfjsLib = lib;
        return lib;
      }

      const cdnChoices = [
        {src:'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.347/build/pdf.min.js', worker:'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.16.347/build/pdf.worker.min.js'},
        {src:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.347/pdf.min.js', worker:'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.347/pdf.worker.min.js'},
        {src:'https://unpkg.com/pdfjs-dist@2.16.347/build/pdf.min.js', worker:'https://unpkg.com/pdfjs-dist@2.16.347/build/pdf.worker.min.js'}
      ];

      for (const cdn of cdnChoices) {
        try {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = cdn.src;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('Failed to load ' + cdn.src));
            document.head.appendChild(s);
          });

          lib = findExisting();
          if (lib) {
            window.pdfjsLib = lib;
            try { if (lib.GlobalWorkerOptions) lib.GlobalWorkerOptions.workerSrc = cdn.worker; } catch(e){console.warn('Could not set workerSrc', e);}            
            console.log('Loaded PDF.js from', cdn.src);
            return lib;
          }
        } catch (err) {
          console.warn('PDF.js CDN load failed:', cdn.src, err);
          // try next
        }
      }

      return null;
    }

    const pdfjsLib = await loadPdfJs();
    if (!pdfjsLib) {
      alert('PDF.js not available. Check console for CDN load errors.');
      console.error('PDF.js global not found on window');
      return;
    }

    // load document
    const loadingTask = pdfjsLib.getDocument({data: arrayBuf});
    pdfDoc = await loadingTask.promise;

    // clear previous
    pages = [];
    pagesList.innerHTML = '';
    pageContainer.innerHTML = '';

    for (let i=1;i<=pdfDoc.numPages;i++){
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({scale: 1.5});

      // Create canvas for rendered PDF page
      const canvas = document.createElement('canvas');
      canvas.className = 'pdf-canvas';
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');

      await page.render({canvasContext: ctx, viewport}).promise;

      // wrapper to position fabric overlay
      const wrapper = document.createElement('div');
      wrapper.className = 'page-wrapper';
      wrapper.style.width = canvas.width + 'px';
      wrapper.style.height = canvas.height + 'px';

      // overlay canvas (Fabric will replace this element by id)
      const overlay = document.createElement('canvas');
      overlay.className = 'fabric-overlay';
      overlay.width = canvas.width;
      overlay.height = canvas.height;
      overlay.style.width = canvas.width + 'px';
      overlay.style.height = canvas.height + 'px';
      overlay.id = 'fabric-' + i;

      wrapper.appendChild(canvas);
      wrapper.appendChild(overlay);
      pageContainer.appendChild(wrapper);

      // create Fabric canvas
      const fCanvas = new fabric.Canvas(overlay.id, {preserveObjectStacking:true});
      fCanvas.setWidth(canvas.width);
      fCanvas.setHeight(canvas.height);
      fCanvas.selection = true;

      pages.push({pageNumber:i, viewport, canvasEl:canvas, wrapperEl:wrapper, fabricCanvas:fCanvas});

      // add thumbnail entry
      const thumb = document.createElement('div');
      thumb.className = 'page-thumb';
      thumb.innerHTML = '<div style="width:40px;height:56px;overflow:hidden;border-radius:4px"><img src="'+canvas.toDataURL()+'" style="width:100%"></div><div><div>Page '+i+'</div><div class="thumb-info">'+Math.round(viewport.width)+'x'+Math.round(viewport.height)+'</div></div>';
      thumb.addEventListener('click', ()=> setActivePage(i-1));
      pagesList.appendChild(thumb);
    }

    // enable controls
    insertImageBtn.disabled = false;
    addTextTool.disabled = false;
    drawTool.disabled = false;
    downloadBtn.disabled = false;

    // select first page
    setActivePage(0);
  }

  function setActivePage(index){
    activePageIndex = index;
    // highlight in thumbnails
    const thumbs = pagesList.querySelectorAll('.page-thumb');
    thumbs.forEach((t,idx)=> t.classList.toggle('active', idx===index));

    // scroll selected page into view
    const p = pages[index];
    if (p) {
      p.wrapperEl.scrollIntoView({behavior:'smooth',block:'center'});
    }
  }

  // Ensure fabric loaded
  async function ensureFabric(){
    if (fabricLib) return fabricLib;
    try{
      fabricLib = await loadFabric();
      return fabricLib;
    }catch(err){
      alert('Failed to load Fabric.js — editing features unavailable.');
      throw err;
    }
  }

  // Insert image flow
  insertImageBtn.addEventListener('click', ()=> openImagePicker());
  function openImagePicker(){
    const t = document.createElement('input');
    t.type = 'file';
    t.accept = 'image/*';
    t.onchange = async (e)=>{
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const url = URL.createObjectURL(f);
      const page = pages[activePageIndex];
      fabric.Image.fromURL(url, img => {
        img.set({left: page.fabricCanvas.getWidth()/2, top: page.fabricCanvas.getHeight()/2, originX:'center', originY:'center', selectable:true});
        // scale down if too large
        const maxW = page.fabricCanvas.getWidth()*0.8;
        const maxH = page.fabricCanvas.getHeight()*0.8;
        img.scaleToWidth(Math.min(maxW, img.width));
        if (img.getScaledHeight() > maxH) img.scaleToHeight(maxH);
        page.fabricCanvas.add(img);
        page.fabricCanvas.setActiveObject(img);
      }, {crossOrigin:'anonymous'});
    };
    t.click();
  }

  // Text tool panel (inline minimal prompt-like UI)
  addTextTool.addEventListener('click', ()=>{
    const txt = prompt('Enter text to add');
    if (!txt) return;
    const color = prompt('Text color (hex)','#000000') || '#000000';
    const sizeStr = prompt('Font size (px)','24') || '24';
    const size = parseInt(sizeStr,10) || 24;
    const page = pages[activePageIndex];
    const textbox = new fabric.Textbox(txt, {
      left: page.fabricCanvas.getWidth()/2,
      top: page.fabricCanvas.getHeight()/2,
      originX:'center',originY:'center',fontSize:size,fill:color
    });
    page.fabricCanvas.add(textbox);
    page.fabricCanvas.setActiveObject(textbox);
  });

  // Draw tool toggle
  drawTool.addEventListener('click', ()=>{
    const page = pages[activePageIndex];
    if (!page) return;
    page.fabricCanvas.isDrawingMode = !page.fabricCanvas.isDrawingMode;
    drawTool.classList.toggle('active', page.fabricCanvas.isDrawingMode);
    if (page.fabricCanvas.isDrawingMode) {
      const color = prompt('Brush color (hex)','rgba(255,0,0,1)') || '#ff0000';
      const size = parseInt(prompt('Brush size (px)','3')||'3',10) || 3;
      page.fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(page.fabricCanvas);
      page.fabricCanvas.freeDrawingBrush.width = size;
      page.fabricCanvas.freeDrawingBrush.color = color;
    }
  });

  // Export: merge overlays onto base canvas and create PDF using jsPDF
  downloadBtn.addEventListener('click', async ()=>{
    if (!pages.length) return;
    const { jsPDF } = window.jspdf || window.jspdf || {};
    if (!jsPDF) {
      alert('Failed to find jsPDF.');
      return;
    }

    // create doc with unit px so we can use canvas px sizes directly
    const doc = new jsPDF({unit:'px', format:[pages[0].canvasEl.width, pages[0].canvasEl.height]});

    for (let i=0;i<pages.length;i++){
      const p = pages[i];
      // draw fabric overlay into an image
      const base = p.canvasEl; // rendered PDF page
      const overlayData = p.fabricCanvas.toDataURL({format:'png'});

      // create temp canvas to merge
      const tmp = document.createElement('canvas');
      tmp.width = base.width; tmp.height = base.height;
      const tctx = tmp.getContext('2d');
      tctx.drawImage(base,0,0);
      await new Promise((res)=>{
        const img = new Image(); img.onload = ()=>{ tctx.drawImage(img,0,0); res(); }; img.src = overlayData; img.crossOrigin='anonymous';
      });

      const mergedData = tmp.toDataURL('image/jpeg', 0.92);
      if (i===0) {
        doc.addImage(mergedData, 'JPEG', 0, 0, tmp.width, tmp.height);
      } else {
        doc.addPage([tmp.width, tmp.height], 'portrait');
        doc.addImage(mergedData, 'JPEG', 0, 0, tmp.width, tmp.height);
      }
    }

    doc.save('edited.pdf');
  });

})();
