import { defineProvider } from "@nuxt/image/runtime";

export default defineProvider<{ baseURL?: string }>({
  getImage(src: string, { modifiers = {} }) {
    try {
      // Если уже облачный URL, возвращаем как есть
      if (src.includes("ecom-sin.website.yandexcloud.net")) {
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
      const newUrl = `https://ecom-sin.website.yandexcloud.net${newPath}`;
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
