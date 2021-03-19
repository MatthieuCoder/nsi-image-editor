/**
 * @author Matthieu
 * @see matthieu-dev.xyz
 * @description A small and simple image editor for my NSI project.
 **/

import {Filters} from "./filters";
import {Renderer} from "./renderer";


const canvas = document.querySelector<HTMLCanvasElement>("#canvas");
const form = document.querySelector<HTMLFormElement>("#filters");
const fileInput = document.querySelector<HTMLInputElement>("#file");
const filterAddSelect = document.querySelector<HTMLInputElement>("#select");
const addFilterButton = document.querySelector<HTMLInputElement>("#add-filter");
const exportButton = document.querySelector<HTMLInputElement>("#img-export");
const renderer = new Renderer(canvas, form);

Filters.forEach(({ name }) => {
    filterAddSelect.innerHTML += `
        <option>
            ${name}
        </option>
    `;
});

const saveData = () => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.setAttribute("style", "display: none");
    return function (url, fileName) {
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
};

const dataSaver = saveData();

exportButton.addEventListener("click", () => {
    dataSaver(canvas.toDataURL("png", 100), "img.png");
});

addFilterButton.addEventListener("click", () => {
    const selectedFilterConstructor = Filters.find((n) => n.name === filterAddSelect.value);
    if (!selectedFilterConstructor) return;
    renderer.addFilter(filterAddSelect.value, selectedFilterConstructor.constructor);
});

fileInput.addEventListener("change",  async () => {
    if (fileInput.files && fileInput.files[0]) {
        const image = fileInput.files[0];

        const data = new Image();
        data.src = URL.createObjectURL(image);

        data.onload = () => {
            const canvas = new OffscreenCanvas(data.width, data.height);
            canvas.height = data.height;
            canvas.width = data.width;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(data, 0, 0, data.width, data.height);
            renderer.updateImage(canvas);
            renderer.render();
        };
    }
});
