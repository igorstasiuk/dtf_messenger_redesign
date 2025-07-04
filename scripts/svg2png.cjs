const sharp = require("sharp");
const sizes = [16, 32, 48, 128];

sizes.forEach((size) => {
  sharp(`public/icons/icon-${size}.svg`)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
    .then(() => console.log(`icon-${size}.png создан`))
    .catch((err) => console.error(`Ошибка для icon-${size}:`, err));
});
