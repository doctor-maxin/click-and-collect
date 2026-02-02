import { defineProvider } from "@nuxt/image/runtime";

export default defineProvider<{ baseURL?: string }>({
  getImage(src: string, { modifiers = {} }) {
    try {
      // Если уже облачный URL, возвращаем как есть
      if (src.includes("bb600a4e-a27e-48b8-bc47-e6bcadae623a.selcdn.net")) {
        return {
          url: src,
        };
      }

      // Парсим URL
      const url = new URL(src);

      const pathParts = url.pathname.split("/").filter(Boolean);

      // Получаем нужные части пути после сезона
      const relevantParts = [
        pathParts[2],
        pathParts[3],
        pathParts[4],
        pathParts[7],
      ];

      // Очищаем имя файла от постфиксов (_500px, _1000px и подобные) и меняем расширение на jpg
      const fileName = relevantParts[relevantParts.length - 1]!;
      let cleanFileName = fileName.replace(/_\d+px(\.\w+)$/, "$1");
      cleanFileName = cleanFileName.replace(/\.webp$/, ".jpg");

      // Заменяем имя файла на очищенное
      relevantParts[relevantParts.length - 1] = cleanFileName;

      // Собираем новый путь
      const newPath = "/" + relevantParts.join("/");

      // Формируем новый URL с облачным доменом
      const newUrl = `https://bb600a4e-a27e-48b8-bc47-e6bcadae623a.selcdn.net${newPath}`;

      const params = new URLSearchParams();

      if (Object.keys(modifiers).length) {
        if (modifiers.width) params.set("width", modifiers.width.toString());
        if (modifiers.height) params.set("height", modifiers.height.toString());
        if (modifiers.format) params.set("fmt", modifiers.format.toString());
        if (modifiers.fit) params.set("fit", modifiers.fit.toString());
        if (modifiers.quality)
          params.set("quality", modifiers.quality.toString());

        return {
          url: newUrl + "?" + params.toString(),
        };
      }

      return {
        url: newUrl,
      };
    } catch (error) {
      // При ошибке возвращаем исходный URL
      return {
        url: src,
      };
    }
  },
});
