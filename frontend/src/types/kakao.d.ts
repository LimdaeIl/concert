interface KakaoPostcodeData {
  zonecode: string;

  address: string;

  roadAddress: string;
  jibunAddress: string;

  autoRoadAddress: string;
  autoJibunAddress: string;

  userSelectedType: 'R' | 'J';

  bname: string;
  buildingName: string;
  apartment: 'Y' | 'N';
}

interface KakaoPostcodeOptions {
  oncomplete: (
      data: KakaoPostcodeData,
  ) => void;

  onclose?: () => void;
}

interface KakaoPostcodeInstance {
  open(): void;
}

interface KakaoNamespace {
  Postcode: new (
      options: KakaoPostcodeOptions,
  ) => KakaoPostcodeInstance;
}

declare const kakao: KakaoNamespace;
