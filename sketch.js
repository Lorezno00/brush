// ===== VARIABILI GLOBALI =====
let gc;
let myPicker;
let myPickerCont;
let myPickerBack;
let roll = 1;
let rotolanza = 1;
let opacityFill;
let opacityStroke;
let strokeW;
let currentWidth;
let currentHeight;
let currentHeightT;
let speed;
let distanzaOrbitale = 0;

let orientationState_gc; 
let orientationState_direct;

let saveButton;
let savePNGButton;
let brushSelect;

// Pennello attualmente selezionato
let activeBrush = '1'; // Inizializza con pennello 1

// ===== SETUP INIZIALE =====
function setup() {
    pixelDensity(2);
    angleMode(DEGREES);

    // Calcola le dimensioni del canvas in base alla finestra
    let canvasWidth = windowWidth;
    let canvasHeight = calculateCanvasHeight();

    // Crea il canvas principale
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("canvasContainer");

    // Inizializza i controlli slider
    initializeSliders();

    // Crea il graphics buffer per i trails
    gc = createGraphics(canvasWidth, canvasHeight);
    gc.clear();
    gc.angleMode(DEGREES);

    orientationState_gc = createOrientationState();
    orientationState_direct = createOrientationState();

    // Inizializza i color picker
    initializeColorPickers();

    // Inizializza il menu a tendina per i pennelli
    initializeBrushSelector();

    // Inizializza i bottoni di salvataggio
    initializeSaveButtons();
    
    windowResized(); // Per assicurarsi che il canvas sia della dimensione corretta
}

// ===== FUNZIONI DI INIZIALIZZAZIONE =====
function initializeSliders() {
    opacityFill = createSlider(0, 255, 125, 5);
    opacityFill.parent("opacContainer");

    opacityStroke = createSlider(0, 255, 125, 5);
    opacityStroke.parent("opacContContainer");

    strokeW = createSlider(0, 20, 0, 0.5);
    strokeW.parent("strokeWContainer");

    currentWidth = createSlider(0, 150, 50, 5);
    currentWidth.parent("wContainer");

    currentHeight = createSlider(0, 150, 50, 5);
    currentHeight.parent("hContainer");
    
    currentHeightT = createSlider(-150, 150, 50, 5);
    currentHeightT.parent("hTContainer");

    speed = createSlider(2, 10, 2, 1);
    speed.parent("speedContainer");

    distanzaOrbitale = createSlider(0, 150, 50, 1);
    distanzaOrbitale.parent("distanzaContainer");
}

function initializeColorPickers() {
    myPicker = createColorPicker("black");
    myPicker.parent("colorContainer");

    myPickerCont = createColorPicker("black");
    myPickerCont.parent("contContainer");

    myPickerBack = createColorPicker("white");
    myPickerBack.parent("backContainer");
}

function initializeBrushSelector() {
    brushSelect = createSelect();
    brushSelect.parent("brushContainer");
    
    // Aggiungi le opzioni dei pennelli
    brushSelect.option("Stella", "1");
    brushSelect.option("Rettangolo rotante", "2");
    brushSelect.option("Ellisse orbitante", "3");
    brushSelect.option("Rettangolo dinamico", "4");
    brushSelect.option("Triangolo", "5");
    brushSelect.option("Rettangolo orientato", "6");
    brushSelect.option("Triangolo orientato", "7");
    
    // Imposta il valore iniziale
    brushSelect.selected("1");
    
    // Gestisci il cambio di selezione
    brushSelect.changed(function() {
        activeBrush = brushSelect.value();
        console.log("Pennello selezionato: " + activeBrush);
    });
}

function initializeSaveButtons() {
    saveButton = createButton('Salva JPG');
    saveButton.parent('saveButtonContainer');
    saveButton.mousePressed(() => save('image.jpg'));

    savePNGButton = createButton('Salva PNG');
    savePNGButton.parent('savePNGButtonContainer');
    savePNGButton.mousePressed(() => save('image.png'));
}

// ===== GESTIONE RIDIMENSIONAMENTO =====
function windowResized() {
    // Ricalcola le dimensioni quando la finestra viene ridimensionata
    let canvasWidth = windowWidth;
    let canvasHeight = calculateCanvasHeight();
    
    // Ridimensiona il canvas principale
    resizeCanvas(canvasWidth, canvasHeight);
    
    // Ridimensiona anche il graphics buffer
    gc.resizeCanvas(canvasWidth, canvasHeight);
}

function calculateCanvasHeight() {
    // Calcola l'altezza disponibile sottraendo l'altezza del pannello controlli
    let controlsPanel = document.getElementById('controls-panel');
    let controlsHeight = controlsPanel ? controlsPanel.offsetHeight : 140;
    return windowHeight - controlsHeight; // Margine di sicurezza
}

// ===== FUNZIONI GEOMETRICHE PERSONALIZZATE =====
function drawStar(context, x, y, radius1, radius2, npoints) {
    let angle = 360 / npoints;
    let halfAngle = angle / 2.0;
    
    context.beginShape();
    for (let a = 0; a < 360; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        context.vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        context.vertex(sx, sy);
    }
    context.endShape(CLOSE);
}

// Funzione per disegnare stella sul canvas principale (senza context)
function drawStarDirect(x, y, radius1, radius2, npoints) {
    let angle = 360 / npoints;
    let halfAngle = angle / 2.0;
    
    beginShape();
    for (let a = 0; a < 360; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

// Funzione per disegnare un triangolo su graphics buffer
function drawTriangle(context, x, y, width, height) {
    context.beginShape();
    context.vertex(x - width, y);
    context.vertex(x, y + height);
    context.vertex(x + width, y);
    context.endShape(CLOSE);
}

// Funzione per disegnare un triangolo sul canvas principale (senza context)
function drawTriangleDirect(x, y, width, height) {
    beginShape();
    vertex(x - width, y);
    vertex(x, y + height);
    vertex(x + width, y);
    endShape(CLOSE);
}

// ===== UTILITY =====
function createOrientationState() {
    return {
        smoothX: mouseX,
        smoothY: mouseY,
        prevSmoothX: mouseX,
        prevSmoothY: mouseY,
        lastCalculatedAngle: 0 // Per gestire il mouse fermo
    };
}

function calculateSmoothOrientation(state, easing = 0.15) {
    // Aggiorna lo stato precedente con il valore smussato attuale
    state.prevSmoothX = state.smoothX;
    state.prevSmoothY = state.smoothY;

    // Aggiorna la posizione smussata attuale verso la posizione reale del mouse
    state.smoothX = lerp(state.smoothX, mouseX, easing);
    state.smoothY = lerp(state.smoothY, mouseY, easing);

    // Calcolo della direzione di movimento
    let dx = state.smoothX - state.prevSmoothX;
    let dy = state.smoothY - state.prevSmoothY;

    let angle;
    // Se il mouse non si è mosso, usa l'ultimo angolo calcolato per evitare "salto"
    if (abs(dx) < 0.1 && abs(dy) < 0.1) { // Usa una piccola soglia per considerare "fermo"
        angle = state.lastCalculatedAngle || 0; // Se non c'è un ultimo angolo, usa 0
    } else {
        angle = atan2(dy, dx);
        state.lastCalculatedAngle = angle; // Salva l'angolo calcolato
    }

    return { // Restituisce un oggetto con l'angolo e le coordinate smussate
        angle: angle,
        smoothX: state.smoothX,
        smoothY: state.smoothY
    };
}

// ===== GESTIONE INPUT DA TASTIERA =====
function keyPressed() {
    if (key === " ") {
        // Spazio: cancella il canvas
        gc.clear();
    }
}

// ===== LOOP PRINCIPALE DI DISEGNO =====
function draw() {
    background(myPickerBack.color());

    // Queste chiamate sono importanti per mantenere gli stati di orientamento aggiornati
    // anche se non vengono usati in ogni pennello.
    calculateSmoothOrientation(orientationState_gc);
    calculateSmoothOrientation(orientationState_direct);

    // Ottieni i valori dai controlli
    let w = currentWidth.value();
    let h = currentHeight.value();
    let ht = currentHeightT.value();
    let distOr = distanzaOrbitale.value();
    
    // Verifica se il mouse è effettivamente sopra il canvas DOM
    let canvasElement = document.querySelector('#canvasContainer canvas');
    let isMouseOverCanvas = false;
    
    if (canvasElement) {
        let rect = canvasElement.getBoundingClientRect();
        let globalMouseX = mouseX + rect.left;
        let globalMouseY = mouseY + rect.top;
        
        // Converti le coordinate p5.js in coordinate globali della pagina
        let actualMouseX = window.mouseX || globalMouseX;
        let actualMouseY = window.mouseY || globalMouseY;
        
        // Verifica se il mouse è dentro i bounds del canvas
        isMouseOverCanvas = actualMouseX >= rect.left && 
                           actualMouseX <= rect.right && 
                           actualMouseY >= rect.top && 
                           actualMouseY <= rect.bottom;
    }
    
    // Fallback: verifica anche con le coordinate p5.js per sicurezza
    let isMouseInCanvasBounds = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
    
    // Il mouse deve essere sia nelle coordinate p5.js che sopra l'elemento canvas
    let shouldDraw = isMouseOverCanvas && isMouseInCanvasBounds;
    
    // Aggiorna la rotazione in base al movimento del mouse (solo se dentro il canvas)
    if (shouldDraw && (mouseX !== pmouseX || mouseY !== pmouseY)) {
        rotolanza += speed.value() / 5;
    }

    // Prepara i colori con trasparenza
    let fillColor = myPicker.color();
    let alphaFillColor = color(
        red(fillColor), 
        green(fillColor), 
        blue(fillColor), 
        opacityFill.value()
    );

    let strokeColor = myPickerCont.color();
    let alphaStrokeColor = color(
        red(strokeColor), 
        green(strokeColor), 
        blue(strokeColor), 
        opacityStroke.value()
    );

    roll = roll + speed.value();

    // ===== DISEGNO CON TRAILS (su graphics buffer) =====
    // Disegna solo se il mouse è premuto E effettivamente sopra il canvas
    if (mouseIsPressed === true && shouldDraw) {
        drawTrails(alphaFillColor, alphaStrokeColor, w, h, ht, distOr);
    }

    // Mostra il graphics buffer sul canvas principale
    image(gc, 0, 0);

    // ===== ANTEPRIMA PENNELLO (senza trails) =====
    // Mostra l'anteprima solo se il mouse è sopra il canvas
    if (shouldDraw) {
        drawPreview(alphaFillColor, alphaStrokeColor, w, h, ht, distOr);
    }
}

// ===== FUNZIONI DI DISEGNO =====
function drawTrails(fillColor, strokeColor, w, h, ht, distOr) {
    // Imposta lo stroke per il graphics buffer
    gc.strokeWeight(strokeW.value());
    if (strokeW.value() === 0) {
        gc.noStroke();
    } else {
        gc.stroke(strokeColor);
    }

    // Disegna il pennello selezionato sul graphics buffer
    drawBrushOnGraphics(fillColor, w, h, ht, distOr);
}

function drawPreview(fillColor, strokeColor, w, h, ht, distOr) {
    // Imposta lo stroke per l'anteprima
    strokeWeight(strokeW.value());
    if (strokeW.value() === 0) {
        noStroke();
    } else {
        stroke(strokeColor);
    }

    // Disegna l'anteprima del pennello selezionato sul canvas principale
    drawBrushDirect(fillColor, w, h, ht, distOr);
}

function drawBrushOnGraphics(fillColor, w, h, ht, distOr) {
    switch(activeBrush) {
        case "1":
            // Stella su graphics buffer
            gc.push();
            gc.fill(fillColor);
            gc.translate(mouseX, mouseY);
            gc.rotate(rotolanza * speed.value());
            drawStar(gc, 0, 0, w/2, h/2, 5);
            gc.pop();
            break;

        case "2":
            // Rettangolo rotante
            gc.push();
            gc.rectMode(CENTER);
            gc.translate(mouseX, mouseY);
            gc.rotate(roll);
            gc.fill(fillColor);
            gc.rect(0, 0, w, h);
            gc.pop();
            break;

        case "3":
            // Ellisse orbitante
            gc.push();
            gc.fill(fillColor);
            gc.ellipseMode(CENTER);
            gc.translate(mouseX, mouseY);
            gc.rotate(roll);
            gc.ellipse(distOr, distOr, w, w);
            gc.pop();
            break;

        case "4":
            // Rettangolo dinamico con rotazione modulabile
            gc.push();
            gc.fill(fillColor);
            gc.translate(mouseX, mouseY);
            gc.rotate(rotolanza * speed.value());
            gc.rectMode(CENTER);
            gc.rect(0, 0, w, abs(pmouseX - mouseX) * speed.value());
            gc.pop();
            break;

        case "5":
            // Triangolo dinamico con rotazione lenta
            gc.push();
            gc.fill(fillColor);
            gc.translate(mouseX, mouseY);
            gc.rotate(rotolanza * speed.value());
            drawTriangle(gc, 0, distOr, w, ht);
            gc.pop();
            break;
        
        case "6":
            // Rettangolo dinamico con rotazione e orientamento del movimento
            gc.push();
            gc.fill(fillColor);
            
            // Calcola l'orientamento usando lo stato specifico per gc del pennello 6
            let orientationData_gc_rect = calculateSmoothOrientation(orientationState_gc);

            // Applica la traslazione alla posizione smussata
            gc.translate(orientationData_gc_rect.smoothX, orientationData_gc_rect.smoothY);
            
            gc.rectMode(CENTER); // Imposta la modalità del rettangolo
            gc.rotate(orientationData_gc_rect.angle); // Applica l'angolo calcolato

            // Disegna il rettangolo al centro dell'origine locale (che è il mouse smussato)
            gc.rect(0, 0, w, h);
            gc.pop();
            break;
        
        case "7":
            // Triangolo dinamico con rotazione e orientamento del movimento
            gc.push();
            gc.fill(fillColor);
            
            // Calcola l'orientamento usando lo stato specifico per gc del pennello 7
            let orientationData_gc_tri = calculateSmoothOrientation(orientationState_gc);

            // Applica la traslazione alla posizione smussata
            gc.translate(orientationData_gc_tri.smoothX, orientationData_gc_tri.smoothY);
            
            gc.rotate(orientationData_gc_tri.angle + 90); // Applica l'angolo calcolato

            // Disegna il triangolo al centro dell'origine locale (che è il mouse smussato)
            drawTriangle(gc, 0, 0, w, ht);
            gc.pop();
            break;
    }
}

function drawBrushDirect(fillColor, w, h, ht, distOr) {
    switch(activeBrush) {
        case "1":
            // Stella sul canvas principale
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            translate(mouseX, mouseY);
            rotate(rotolanza * speed.value());
            drawStarDirect(0, 0, w/2, h/2, 5);
            pop();
            break;

        case "2":
            // Rettangolo rotante
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            rectMode(CENTER);
            translate(mouseX, mouseY);
            rotate(roll);
            rect(0, 0, w, h);
            pop();
            break;

        case "3":
            // Ellisse orbitante
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            ellipseMode(CENTER);
            translate(mouseX, mouseY);
            rotate(roll);
            ellipse(distOr, distOr, w, w);
            pop();
            break;

        case "4":
            // Rettangolo dinamico con rotazione veloce
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            translate(mouseX, mouseY);
            rotate(rotolanza * speed.value());
            rectMode(CENTER);
            rect(0, 0, w, abs(pmouseX - mouseX) * speed.value());
            pop();
            break;

        case "5":
            // Triangolo dinamico con rotazione lenta
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            translate(mouseX, mouseY);
            rotate(rotolanza * speed.value());
            drawTriangleDirect(0, distOr, w, ht);
            pop();
            break;

        case "6":
            // Rettangolo dinamico con rotazione e orientamento del movimento
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            
            // Calcola l'orientamento usando lo stato specifico per il disegno diretto
            let orientationData_rect = calculateSmoothOrientation(orientationState_direct);

            // Applica la traslazione alla posizione smussata
            translate(orientationData_rect.smoothX, orientationData_rect.smoothY);
            
            rectMode(CENTER); // Imposta la modalità del rettangolo
            rotate(orientationData_rect.angle); // Applica l'angolo calcolato

            // Disegna il rettangolo al centro dell'origine locale (che è il mouse smussato)
            rect(0, 0, w, h);
            pop();
            break;

        case "7":
            // Triangolo dinamico con rotazione e orientamento del movimento
            push();
            noFill();
            stroke(fillColor);
            strokeWeight(0.5 + strokeW.value());
            
            // Calcola l'orientamento usando lo stato specifico per il disegno diretto
            let orientationData_tri = calculateSmoothOrientation(orientationState_direct);

            // Applica la traslazione alla posizione smussata
            translate(orientationData_tri.smoothX, orientationData_tri.smoothY);
            
            rotate(orientationData_tri.angle + 90); // Applica l'angolo calcolato

            // Disegna il triangolo al centro dell'origine locale (che è il mouse smussato)
            drawTriangleDirect(0, 0, w, ht);
            pop();
            break;
    }
}