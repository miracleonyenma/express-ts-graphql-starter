type GenerateOptions = {
  useUnderScore: boolean;
};

export const useGenerateSlug = () => {
  const generateSlug = (text: string, options?: GenerateOptions) => {
    return text
      .toLowerCase()
      .replace(/ /g, options?.useUnderScore ? "_" : "-")
      .replace(/[^\w-]+/g, "");
  };

  return { generateSlug };
};
