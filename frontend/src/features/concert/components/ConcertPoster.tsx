import {
  type ImgHTMLAttributes,
  useState,
} from 'react';

import defaultConcertPoster from '@/assets/default-concert-poster.png';

interface ConcertPosterProps
    extends Omit<
        ImgHTMLAttributes<HTMLImageElement>,
        'src'
    > {
  src?: string | null;
}

export default function ConcertPoster({
                                        src,
                                        alt = '공연 포스터',
                                        ...props
                                      }: ConcertPosterProps) {
  const [hasError, setHasError] =
      useState(false);

  const imageSrc =
      !src || hasError
          ? defaultConcertPoster
          : src;

  return (
      <img
          {...props}
          src={imageSrc}
          alt={alt}
          onError={() => {
            setHasError(true);
          }}
      />
  );
}
