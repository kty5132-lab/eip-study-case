/*
 * 실기 문제 은행 — 추가 세트 1 (practical.js 뒤에 이어 붙음)
 * 형식은 practical.js와 같습니다: [유형, 문제, [허용 정답들], 해설, (선택) 코드]
 * 이미 푼 기록을 보존하려면 배열 '맨 뒤에만' 추가하세요. 코드·SQL·계산 문제는 실제 실행으로 검증했습니다.
 */
(function (P) {
  const add = (area, rows) => { (P[area] ||= []).push(...rows); };

  add('se', [
    ["term", "복잡한 서브시스템 앞에 단순한 통합 인터페이스를 제공하는 구조 패턴은?", ["퍼사드", "파사드", "Facade"], "Facade 패턴은 서브시스템 사용을 단순화하고 결합도를 낮춥니다."],
    ["term", "객체에 동적으로 새로운 기능을 덧붙이며 상속의 대안이 되는 구조 패턴은?", ["데코레이터", "Decorator"], "Decorator는 객체를 감싸 기능을 확장합니다. 자바 I/O 스트림이 대표 사례입니다."],
    ["term", "실제 객체에 대한 접근을 제어하기 위해 대리 객체를 두는 구조 패턴은?", ["프록시", "Proxy"], "Proxy는 지연 로딩, 접근 제어, 캐싱에 사용됩니다."],
    ["term", "복잡한 객체의 생성 과정을 단계별로 분리하는 생성 패턴은?", ["빌더", "Builder"], "Builder 패턴은 생성 절차와 표현을 분리합니다."],
    ["term", "상위 클래스가 알고리즘의 골격을 정하고 일부 단계를 하위 클래스가 구현하게 하는 행위 패턴은?", ["템플릿 메소드", "템플릿 메서드", "Template Method"], "Template Method는 상속을 이용하고, Strategy는 합성(위임)을 이용합니다."],
    ["term", "호환되지 않는 인터페이스를 가진 클래스들을 함께 사용할 수 있게 변환해 주는 구조 패턴은?", ["어댑터", "Adapter"], "Adapter는 기존 코드를 수정하지 않고 인터페이스를 맞춥니다(래퍼)."],
    ["term", "알고리즘을 캡슐화하여 런타임에 교체할 수 있게 하는 행위 패턴은?", ["전략", "스트래티지", "Strategy"], "Strategy(전략) 패턴입니다."],
    ["term", "모듈 내 요소들이 동일한 입력 또는 출력 자료를 사용하여 서로 다른 기능을 수행하는 응집도는?", ["통신적 응집도", "통신 응집도", "Communicational Cohesion"], "응집도(약→강): 우연적 < 논리적 < 시간적 < 절차적 < 통신적 < 순차적 < 기능적."],
    ["term", "SOLID 원칙 중 '상위 모듈은 하위 모듈에 직접 의존하지 않고 추상화에 의존해야 한다'는 원칙을 영문 약어로 쓰시오.", ["DIP", "의존 역전 원칙", "의존성 역전 원칙"], "DIP(Dependency Inversion Principle). 의존성 주입(DI)으로 구현하는 경우가 많습니다."],
    ["term", "SOLID 원칙 중 '클라이언트는 사용하지 않는 메소드에 의존하면 안 된다'는 원칙을 영문 약어로 쓰시오.", ["ISP", "인터페이스 분리 원칙"], "ISP(Interface Segregation Principle): 큰 인터페이스를 역할별로 쪼갭니다."],
    ["desc", "GoF 디자인 패턴의 3가지 분류와 각 분류의 대표 패턴을 하나씩 쓰시오.", [], "생성 패턴: Singleton·Factory Method·Builder / 구조 패턴: Adapter·Facade·Proxy·Decorator / 행위 패턴: Observer·Strategy·Template Method·Command"],
    ["desc", "폭포수 모델과 애자일 방법론의 차이를 서술하시오.", [], "폭포수는 요구사항 분석→설계→구현→테스트를 순차적으로 진행하고 단계 산출물과 문서를 중시해 변경에 취약하다. 애자일은 짧은 반복(스프린트)으로 동작하는 소프트웨어를 자주 전달하며 고객 피드백과 변화 대응을 중시한다."],
  ]);

  add('test', [
    ["term", "같은 테스트 케이스를 반복하면 새로운 결함을 찾지 못하게 되는 현상(테스트 원리)은?", ["살충제 패러독스", "Pesticide Paradox"], "테스트 케이스는 주기적으로 검토하고 갱신해야 합니다."],
    ["term", "'제품을 올바르게 만들고 있는가?'(명세 대비 구현)에 초점을 맞추는 활동은?", ["검증", "Verification", "베리피케이션"], "Verification은 개발 과정이 명세를 따르는지, Validation(확인)은 사용자 요구를 충족하는지 확인합니다."],
    ["term", "모든 모듈을 개별 테스트한 후 한꺼번에 통합하여 테스트하는 방식은?", ["빅뱅 테스트", "빅뱅", "Big Bang"], "빅뱅 방식은 간단하지만 결함 위치를 찾기 어렵습니다."],
    ["term", "프로그램의 모든 문장이 한 번 이상 실행되도록 설계하는 화이트박스 커버리지는?", ["구문 커버리지", "문장 커버리지", "Statement Coverage"], "구문 커버리지는 가장 약한 커버리지 기준입니다."],
    ["term", "입력 조건과 출력 결과의 인과 관계를 그래프로 표현해 테스트 케이스를 만드는 블랙박스 기법은?", ["원인-결과 그래프", "원인 결과 그래프", "Cause-Effect Graph", "원인결과 그래프"], "원인-결과 그래프 기법은 의사결정 테이블로 변환해 테스트 케이스를 도출합니다."],
    ["term", "선정된 개발자 환경에서 사용자가 사용하고 개발자가 옆에서 관찰하며 오류를 기록하는 인수 테스트는?", ["알파 테스트", "알파", "Alpha Test"], "알파는 통제된 환경(개발자 관찰), 베타는 실제 사용자 환경입니다."],
    ["code", "제어 흐름 그래프에서 판단(분기) 노드가 5개일 때 McCabe 순환 복잡도는?", ["6"], "V(G) = 판단 노드 수 + 1 = 6."],
    ["desc", "소프트웨어 테스트 7원칙 중 3가지를 쓰시오.", [], "① 테스팅은 결함이 존재함을 밝히는 것이다 ② 완벽한 테스팅은 불가능하다 ③ 초기에 테스트를 시작한다 ④ 결함 집중 ⑤ 살충제 패러독스 ⑥ 정황에 의존한다 ⑦ 오류-부재의 궤변 (이 중 3가지)"],
  ]);

  add('db', [
    ["term", "튜플을 유일하게 식별할 수 있으나 최소성은 만족하지 않아도 되는 속성의 집합은?", ["슈퍼키", "Super Key"], "슈퍼키 ⊇ 후보키 ⊇ 기본키."],
    ["term", "INSERT, UPDATE, DELETE 같은 이벤트가 발생하면 자동으로 실행되는 데이터베이스 객체는?", ["트리거", "Trigger"], "트리거는 무결성 유지, 감사 로그 기록 등에 사용합니다."],
    ["term", "M:N 관계를 관계형 모델로 구현하기 위해 만드는 테이블은?", ["연결 테이블", "교차 테이블", "Junction Table", "매핑 테이블", "연결 엔티티", "Associative Entity"], "연결 테이블은 두 테이블의 기본키를 외래키로 가져 M:N을 두 개의 1:N으로 분해합니다."],
    ["term", "개념 스키마가 변경되어도 외부 스키마(사용자 뷰)는 영향을 받지 않는 성질은?", ["논리적 데이터 독립성", "논리적 독립성"], "논리적 독립성은 외부-개념 사상, 물리적 독립성은 개념-내부 사상으로 보장합니다."],
    ["term", "DB의 메타데이터(테이블·컬럼·권한 등)를 저장하는 DBMS 관리 영역은?", ["시스템 카탈로그", "데이터 사전", "Data Dictionary", "카탈로그"], "시스템 카탈로그(데이터 사전)는 DBMS가 스스로 관리합니다."],
    ["term", "다른 트랜잭션이 갱신한 값을 덮어써서 먼저 갱신한 내용이 사라지는 병행 제어 문제는?", ["갱신 손실", "갱신 분실", "Lost Update"], "로킹, 타임스탬프 기법으로 방지합니다."],
    ["term", "데이터 웨어하우스 구축 시 원천 시스템에서 데이터를 추출·변환·적재하는 과정을 영문 약어로 쓰시오.", ["ETL"], "ETL = Extract, Transform, Load."],
    ["desc", "ACID 4가지 성질을 쓰고 각각 한 줄로 설명하시오.", [], "원자성: 모두 반영되거나 전혀 반영되지 않음 / 일관성: 실행 전후 DB가 일관된 상태 유지 / 격리성: 동시 실행 트랜잭션이 서로 간섭하지 않음 / 지속성: 완료된 결과는 영구 반영"],
  ]);

  add('sql', [
    ["term", "점수가 70 이상 90 이하인 행을 조회하는 연산자를 쓰시오.\n\nSELECT * FROM student WHERE score (    ) 70 AND 90;", ["BETWEEN"], "BETWEEN a AND b는 양 끝값을 포함합니다."],
    ["term", "중복 값은 허용하지 않지만 NULL은 허용하는 제약 조건을 쓰시오.\n\nCREATE TABLE t (email VARCHAR(50) (    ));", ["UNIQUE"], "PRIMARY KEY는 중복·NULL 모두 불가, UNIQUE는 중복만 불가합니다."],
    ["term", "student 테이블의 name 컬럼에 검색 속도를 높이기 위한 인덱스를 만드는 명령의 빈칸을 쓰시오.\n\nCREATE (    ) idx_name ON student(name);", ["INDEX"], "인덱스는 조회를 빠르게 하지만 INSERT·UPDATE·DELETE 비용이 늘어납니다."],
    ["term", "데이터를 삽입하는 SQL의 빈칸을 쓰시오.\n\nINSERT INTO student (id, name) (    ) (1, '홍길동');", ["VALUES"], "INSERT INTO 테이블 (컬럼들) VALUES (값들);"],
    ["term", "두 테이블의 모든 행을 가능한 모든 조합으로 결합하는 조인의 빈칸을 쓰시오.\n\nSELECT * FROM A (    ) JOIN B;", ["CROSS"], "CROSS JOIN(카티션 곱) 결과 행 수 = A의 행 수 × B의 행 수."],
    ["term", "서브쿼리가 반환한 값 목록 중 하나와 일치하는 행을 찾는 연산자를 쓰시오.\n\nSELECT * FROM A WHERE id (    ) (SELECT id FROM B);", ["IN"], "IN은 목록 중 하나와 같으면 참입니다."],
    ["code", "테이블 E(id, dept, sal)\n(1, A, 300) (2, A, 500) (3, B, 200) (4, B, 400) (5, C, 700)\n\nSELECT COUNT(DISTINCT dept) FROM E; 의 결과는?", ["3"], "중복을 제거한 dept 값은 A, B, C → 3."],
    ["code", "테이블 E(id, dept, sal)\n(1, A, 300) (2, A, 500) (3, B, 200) (4, B, 400) (5, C, 700)\n\nSELECT SUM(sal) FROM E WHERE dept IN ('A', 'C'); 의 결과는?", ["1500"], "300 + 500 + 700 = 1500."],
    ["code", "테이블 E(id, dept, sal)\n(1, A, 300) (2, A, 500) (3, B, 200) (4, B, 400) (5, C, 700)\n\n다음 쿼리가 출력하는 dept 값을 순서대로 쓰시오.\nSELECT dept FROM E GROUP BY dept HAVING COUNT(*) = 2 ORDER BY dept;", ["A, B", "A B"], "A와 B는 각각 2행, C는 1행."],
    ["code", "테이블 X에는 2행, 테이블 Y에는 3행이 있다. SELECT COUNT(*) FROM X CROSS JOIN Y; 의 결과는?", ["6"], "카티션 곱은 2 × 3 = 6행."],
    ["sql", "student(id, name, dept, score) 테이블에서 전체 평균보다 점수가 높은 학생의 이름을 조회하는 SQL을 작성하시오.", ["SELECT name FROM student WHERE score > (SELECT AVG(score) FROM student);"], "SELECT name\nFROM student\nWHERE score > (SELECT AVG(score) FROM student);"],
    ["sql", "student 테이블에서 학과별 학생 수를 조회하는 SQL을 작성하시오.", ["SELECT dept, COUNT(*) FROM student GROUP BY dept;"], "SELECT dept, COUNT(*)\nFROM student\nGROUP BY dept;"],
    ["sql", "student 테이블에 (id=10, name='김철수', dept='컴공', score=85) 행을 삽입하는 SQL을 작성하시오.", ["INSERT INTO student (id, name, dept, score) VALUES (10, '김철수', '컴공', 85);", "INSERT INTO student VALUES (10, '김철수', '컴공', 85);"], "INSERT INTO student (id, name, dept, score)\nVALUES (10, '김철수', '컴공', 85);"],
    ["sql", "student 테이블에서 score가 NULL인 행을 모두 삭제하는 SQL을 작성하시오.", ["DELETE FROM student WHERE score IS NULL;"], "DELETE FROM student\nWHERE score IS NULL;   -- = NULL 이 아니라 IS NULL"],
  ]);

  add('os', [
    ["code", "시간 할당량 2인 라운드 로빈에서 P1(실행 4), P2(실행 2)가 동시에 도착(P1 먼저)했다. 평균 대기 시간은?", ["2"], "P1: 0~2, P2: 2~4(종료), P1: 4~6(종료). 대기 시간 P1 = 6−4 = 2, P2 = 4−2 = 2 → 평균 2."],
    ["code", "위 문제(라운드 로빈, P1=4, P2=2, 시간 할당량 2)에서 평균 반환 시간은?", ["5"], "종료 시각 P1=6, P2=4 → (6+4)/2 = 5."],
    ["term", "페이지 크기가 1024바이트일 때 논리 주소 3000의 페이지 번호와 오프셋을 '번호, 오프셋' 형태로 쓰시오.", ["2, 952", "2 952"], "3000 = 1024 × 2 + 952."],
    ["code", "서브넷 마스크가 /27일 때 사용 가능한 호스트 주소의 수는?", ["30"], "호스트 비트 5비트 → 2^5 − 2 = 30."],
    ["term", "SSH의 기본 포트 번호는?", ["22"], "FTP 21, SSH 22, Telnet 23, SMTP 25, HTTP 80, HTTPS 443."],
    ["term", "ping 명령이 사용하는 인터넷 제어 메시지 프로토콜(약어)은?", ["ICMP"], "ICMP Echo Request/Reply."],
    ["term", "메일 서버를 지정하는 DNS 레코드 유형은?", ["MX", "MX 레코드"], "A=IPv4, AAAA=IPv6, CNAME=별칭, MX=메일, PTR=역방향 조회."],
    ["term", "리눅스에서 파일 내용 중 특정 문자열이 포함된 줄을 검색하는 명령은?", ["grep"], "grep 패턴 파일."],
    ["term", "OSI 2계층 장비로 MAC 주소를 학습하여 해당 포트로만 프레임을 전달하는 장비는?", ["스위치", "Switch", "L2 스위치"], "허브는 1계층(모든 포트로 전달), 라우터는 3계층 장비입니다."],
    ["term", "TCP에서 수신 측의 처리 능력에 맞게 송신 데이터 양을 조절하는 기능은?", ["흐름 제어", "Flow Control"], "흐름 제어는 슬라이딩 윈도우 방식을 사용합니다. 혼잡 제어와 구분하세요."],
  ]);

  add('sec', [
    ["term", "티켓 기반으로 인증하며 대칭키 암호를 사용하는 네트워크 인증 프로토콜은?", ["커버로스", "Kerberos", "케르베로스"], "Kerberos는 KDC가 티켓을 발급하여 SSO를 구현합니다."],
    ["term", "블록 암호 운용 모드 중 같은 평문 블록이 항상 같은 암호문 블록이 되어 패턴이 노출되는 모드는?", ["ECB", "ECB 모드"], "CBC는 이전 암호문 블록과 XOR하여 이 문제를 줄입니다."],
    ["term", "공개키 소유자의 신원을 보증하는 인증서를 발급하는 신뢰 기관(약어)은?", ["CA", "인증기관", "인증 기관"], "PKI에서 CA가 X.509 인증서에 서명합니다."],
    ["term", "SQL 삽입·XSS 같은 웹 애플리케이션 공격을 HTTP 수준에서 탐지·차단하는 보안 장비(약어)는?", ["WAF", "웹 방화벽", "웹 애플리케이션 방화벽"], "WAF는 L7 방화벽입니다."],
    ["term", "문자메시지(SMS)에 악성 링크를 넣어 설치를 유도하는 공격 기법은?", ["스미싱", "Smishing"], "피싱=이메일, 스미싱=문자, 파밍=DNS·hosts 조작, 큐싱=QR코드."],
    ["term", "사용자 모르게 DNS 정보나 hosts 파일을 조작해 가짜 사이트로 접속시키는 공격은?", ["파밍", "Pharming"], "파밍은 정상 주소를 입력해도 가짜 사이트로 연결되는 공격입니다."],
    ["term", "정상 프로그램처럼 위장해 설치되며 악의적인 기능을 수행하는 악성 코드는?", ["트로이 목마", "트로이목마", "Trojan Horse", "Trojan"], "트로이 목마는 자기 복제를 하지 않는 것이 웜·바이러스와의 차이입니다."],
    ["term", "인가 없이 시스템에 접속할 수 있도록 몰래 만들어 둔 통로는?", ["백도어", "Backdoor"], "백도어는 개발 단계에서 남긴 유지보수용 통로가 악용되기도 합니다."],
  ]);

  add('code', [
    ["code", "다음 C 코드의 출력 결과를 쓰시오.", ["B"], "*(s+1)은 문자열 \"ABC\"의 두 번째 문자입니다.", "char *s = \"ABC\";\nprintf(\"%c\", *(s + 1));"],
    ["code", "다음 C 코드의 출력 결과를 쓰시오.", ["10"], "i=1:1, i=2:1+2, i=3:1+2+3 → 1 + 3 + 6 = 10.", "int i, j, s = 0;\nfor (i = 1; i <= 3; i++)\n    for (j = 1; j <= i; j++)\n        s += j;\nprintf(\"%d\", s);"],
    ["code", "다음 C 코드의 출력 결과를 쓰시오.", ["13"], "3<<2 = 12, 12|1 = 13.", "int x = 3;\nx <<= 2;\nx |= 1;\nprintf(\"%d\", x);"],
    ["code", "다음 C 코드의 출력 결과를 쓰시오.", ["6"], "gcd(48,18) → gcd(18,12) → gcd(12,6) → gcd(6,0) = 6.", "int gcd(int a, int b) {\n    return b == 0 ? a : gcd(b, a % b);\n}\n\nprintf(\"%d\", gcd(48, 18));"],
    ["code", "다음 C 코드의 출력 결과를 쓰시오. (매크로 주의)", ["11"], "매크로는 단순 치환이라 SQ(2+3) = 2+3*2+3 = 11 입니다.", "#define SQ(x) x*x\n\nprintf(\"%d\", SQ(2 + 3));"],
    ["code", "다음 C 코드의 출력 결과를 쓰시오.", ["40 30"], "p = a+1이므로 p[2] = a[3] = 40, *(a+4) − *p = 50 − 20 = 30.", "int a[5] = {10, 20, 30, 40, 50};\nint *p = a + 1;\nprintf(\"%d %d\", p[2], *(a + 4) - *p);"],
    ["code", "다음 Java 코드의 출력 결과를 쓰시오.", ["AB"], "하위 클래스 객체를 생성하면 상위 클래스 생성자가 먼저 실행됩니다.", "class A { A() { System.out.print(\"A\"); } }\nclass B extends A { B() { System.out.print(\"B\"); } }\n\nnew B();"],
    ["code", "다음 Java 코드의 출력 결과를 쓰시오.", ["dcba"], "append로 \"abcd\"를 만든 뒤 reverse로 뒤집습니다.", "StringBuilder sb = new StringBuilder(\"ab\");\nsb.append(\"cd\").reverse();\nSystem.out.println(sb);"],
    ["code", "다음 Java 코드의 출력 결과를 쓰시오.", ["9"], "b = a는 같은 배열을 참조하므로 b[0] 변경이 a[0]에 반영됩니다.", "int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 9;\nSystem.out.println(a[0]);"],
    ["code", "다음 Java 코드의 출력 결과를 쓰시오.", ["true true 4"], "같은 문자열 리터럴은 문자열 풀에서 공유되어 == 도 true. equalsIgnoreCase는 대소문자 무시, length는 4.", "String a = \"Java\";\nString b = \"Java\";\nSystem.out.println((a == b) + \" \" + \"JAVA\".equalsIgnoreCase(a) + \" \" + a.length());"],
    ["code", "다음 Java 코드의 출력 결과를 쓰시오.", ["8"], "f(1)=f(2)=1, f(3)=2, f(4)=3, f(5)=5, f(6)=8.", "static int f(int n) {\n    if (n <= 2) return 1;\n    return f(n - 1) + f(n - 2);\n}\n\nSystem.out.println(f(6));"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["['a', 'b', 'c'] x-y"], "split은 리스트를 반환하고 '-'.join은 요소 사이에 '-'를 넣어 이어 붙입니다.", "print(\"a,b,c\".split(\",\"), \"-\".join([\"x\", \"y\"]))"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["[2, 3, 4]"], "map이 모든 원소에 x+1을 적용합니다.", "print(list(map(lambda x: x + 1, [1, 2, 3])))"],
    ["code", "다음 Python 코드의 출력 결과를 두 줄로 쓰시오.", ["E F"], "ValueError → except(E) → finally(F) 순서로 출력됩니다. (줄바꿈 두 줄: E / F)", "try:\n    int(\"x\")\nexcept ValueError:\n    print(\"E\")\nfinally:\n    print(\"F\")"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["[1, 2, 3]"], "x[:]는 얕은 복사로 새 리스트를 만들므로 y에 추가해도 x는 그대로입니다.", "x = [1, 2, 3]\ny = x[:]\ny.append(4)\nprint(x)"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["3 -4 -2"], "// 는 내림 나눗셈이라 -7//2 = -4, % 는 제수의 부호를 따라 7 % -3 = -2.", "print(7 // 2, -7 // 2, 7 % -3)"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["[('a', 1), ('b', 2)]"], "items()를 정렬하면 키 기준 오름차순의 (키, 값) 튜플 리스트가 됩니다.", "d = {'b': 2, 'a': 1}\nprint(sorted(d.items()))"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["1 [2, 3]"], "*b는 나머지 요소를 리스트로 받습니다.", "t = (1, 2, 3)\na, *b = t\nprint(a, b)"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["24 3"], "f(4)=24, f(5)=120이며 len(str(120)) = 3.", "def f(n):\n    return 1 if n <= 1 else n * f(n - 1)\n\nprint(f(4), len(str(f(5))))"],
    ["code", "다음 Python 코드의 출력 결과를 쓰시오.", ["2 Hello World heLlo world"], "count('o')=2, title()은 단어 첫 글자를 대문자로, replace의 세 번째 인자 1은 첫 번째 일치만 바꿉니다.", "s = \"hello world\"\nprint(s.count(\"o\"), s.title(), s.replace(\"l\", \"L\", 1))"],
  ]);

  add('algo', [
    ["term", "전위(Preorder) 순회 결과가 A B D E C F, 중위(Inorder) 순회 결과가 D B E A C F인 이진 트리의 후위(Postorder) 순회 결과를 쓰시오.", ["D E B F C A", "DEBFCA"], "루트는 A. 왼쪽 서브트리(중위 D B E)는 B가 루트이고 D, E가 자식, 오른쪽(C F)은 C가 루트이고 F가 오른쪽 자식. 후위: D E B F C A."],
    ["code", "원판 4개의 하노이 탑을 옮기는 데 필요한 최소 이동 횟수는?", ["15"], "2^n − 1 = 2^4 − 1 = 15."],
    ["code", "차수가 2인 노드가 7개인 이진 트리의 리프(단말) 노드 수는?", ["8"], "n0 = n2 + 1 = 7 + 1 = 8."],
    ["code", "정점이 8개인 무방향 완전 그래프의 간선 수는?", ["28"], "n(n−1)/2 = 8×7/2 = 28."],
    ["term", "이미 정렬된 배열에 삽입 정렬을 적용할 때의 시간 복잡도를 Big-O로 쓰시오.", ["O(n)"], "삽입 정렬은 최선 O(n), 평균·최악 O(n²)."],
    ["code", "해시 함수 h(k) = k mod 7을 사용할 때 키 38이 저장되는 버킷 번호는?", ["3"], "38 = 7×5 + 3."],
    ["term", "그래프 탐색 중 큐를 사용하며 시작 정점에서 가까운 정점부터 방문하는 방식은?", ["BFS", "너비 우선 탐색", "너비우선탐색", "Breadth First Search"], "BFS는 큐, DFS는 스택(또는 재귀)을 사용합니다."],
    ["term", "그래프 탐색 중 스택(또는 재귀)을 사용하며 한 경로를 끝까지 따라간 뒤 되돌아오는 방식은?", ["DFS", "깊이 우선 탐색", "깊이우선탐색", "Depth First Search"], "DFS는 미로 탐색, 위상 정렬, 사이클 검사 등에 사용됩니다."],
    ["term", "빈 큐에 1, 2, 3을 차례로 enqueue → dequeue → 4 enqueue → dequeue → dequeue 하였다. dequeue로 꺼낸 값을 순서대로 쓰시오.", ["1 2 3", "1, 2, 3"], "큐는 FIFO이므로 들어간 순서대로 1, 2, 3이 나오고 4가 남습니다."],
  ]);
})(window.EIP_DATA.practical);
