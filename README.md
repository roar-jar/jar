# DOEAZI Profile Site

정아람 소개 페이지를 GitHub Pages에 올릴 수 있도록 정리한 정적 사이트입니다.

## 포함 파일

- `index.html`: 메인 페이지
- `workcare-xai.html`: 현장직 권리 XAI 공통 허브 페이지
- `workcare-xai-accident.html`: 사고 대응 전용 결과 페이지
- `workcare-xai-payment.html`: 체불 대응 전용 결과 페이지
- `workcare-xai-contract.html`: 계약 점검 전용 결과 페이지
- `_headers`: Cloudflare Pages용 보안 헤더 및 검색엔진 비노출 설정
- `.nojekyll`: GitHub Pages에서 Jekyll 처리 없이 정적 파일 그대로 배포

## 배포 방법

1. GitHub에서 새 저장소를 만듭니다.
   - 일반 저장소 예시: `jar`
   - 사용자 사이트 예시: `<github-id>.github.io`
2. 이 폴더 안의 파일만 새 저장소 루트에 올립니다.
3. 새 저장소 폴더에서 아래 명령을 실행합니다.

```bash
git init
git add .
git commit -m "Add DOEAZI profile site"
git branch -M main
git remote add origin https://github.com/<github-id>/<repo-name>.git
git push -u origin main
```

4. GitHub 저장소에서 `Settings > Pages`로 이동합니다.
5. `Build and deployment`를 `Deploy from a branch`로 설정합니다.
6. Branch는 `main`, 폴더는 `/(root)`를 선택하고 저장합니다.

## 링크 형식

- 저장소명이 `<github-id>.github.io` 인 경우
  - `https://<github-id>.github.io/`
- 일반 저장소인 경우
  - `https://<github-id>.github.io/<repo-name>/`

## 배포 전 확인할 점

- 이미지 파일과 외부 링크 경로가 저장소 구조와 맞는지 확인합니다.
- GitHub Pages 경로는 저장소명 변경 시 함께 바뀌므로 최종 URL을 다시 확인합니다.

## 비공개 공유 배포 권장안

`링크만 아는 사람만 보는 비공개 공유` 목적이라면 GitHub Pages보다 `Cloudflare Pages + Cloudflare Access`가 더 맞습니다.

권장 구조:

1. GitHub 저장소는 `private` 으로 유지합니다.
2. Cloudflare Pages에 GitHub 저장소를 연결하거나, `Direct Upload` 로 정적 파일을 올립니다.
3. 배포 도메인 또는 커스텀 서브도메인 앞단에 `Cloudflare Access` 를 붙입니다.
4. 로그인 방식은 `One-time PIN` 을 사용하고, 허용할 이메일만 Access 정책에 넣습니다.

이 방식이면:

- URL은 공유할 수 있어도 아무나 바로 열 수 없습니다.
- 허용된 이메일만 OTP 메일을 받아 접속할 수 있습니다.
- 정적 사이트라서 별도 서버 없이 운영 가능합니다.

### Cloudflare Pages 배포 순서

1. Cloudflare 대시보드에서 `Workers & Pages` 로 이동합니다.
2. `Create application > Pages` 를 선택합니다.
3. 배포 방식은 둘 중 하나를 고릅니다.
   - GitHub 연결
   - Direct Upload
4. 이 폴더의 파일을 배포 대상으로 설정합니다.
   - 빌드 없는 정적 사이트이므로 output directory 는 루트 그대로 쓰면 됩니다.
5. 배포 후 기본 `*.pages.dev` 주소가 생기면 접속 확인을 합니다.

### Access 보호 순서

1. Cloudflare Zero Trust 에서 `Access` 로 이동합니다.
2. `Applications > Add an application > Self-hosted` 를 선택합니다.
3. 방금 배포한 호스트명 또는 커스텀 도메인을 연결합니다.
4. 로그인 방법으로 `One-time PIN` 을 켭니다.
5. Allow 정책에 허용할 이메일 주소 또는 도메인을 넣습니다.

### 운영 팁

- 실제 공유는 `커스텀 서브도메인 + Access` 조합이 가장 깔끔합니다.
- 검색 노출을 줄이기 위해 `_headers` 에 `X-Robots-Tag: noindex` 를 넣어두었습니다.
- GitHub 공개 저장소에 그대로 올리는 방식은 이 요구사항과 맞지 않습니다.
