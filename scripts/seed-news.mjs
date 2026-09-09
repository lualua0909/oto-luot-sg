/**
 * Seed 10 bài viết mẫu vào Firestore collection "news".
 * Ảnh bìa lấy lại từ coverImage của các xe đang có (đã nằm trên Vercel Blob).
 *
 * Chạy: node scripts/seed-news.mjs
 */
import fs from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import slugify from "slugify";

const SERVICE_ACCOUNT = "voice-b-dbb5e-firebase-adminsdk-fbsvc-1d3189699f.json";

const POSTS = [
  {
    title: "Kinh nghiệm mua xe ô tô cũ: 7 bước kiểm tra trước khi xuống tiền",
    excerpt:
      "Xe cũ giá tốt nhưng rủi ro cũng nhiều. 7 bước kiểm tra dưới đây giúp bạn loại ngay những chiếc xe có vấn đề.",
    content: `Mua xe cũ tiết kiệm được vài trăm triệu so với xe mới, nhưng chỉ khi bạn chọn đúng xe. Dưới đây là quy trình 7 bước chúng tôi áp dụng cho mọi chiếc xe trước khi nhận ký gửi.

1. Kiểm tra giấy tờ
Đối chiếu số khung, số máy trên xe với đăng ký. Xem xe đã sang tên bao nhiêu đời chủ, có đang thế chấp ngân hàng hay không.

2. Soi lớp sơn
Đứng chéo góc 45 độ nhìn dọc thân xe. Sơn zin phản chiếu đều; chỗ sơn lại thường khác màu nhẹ và bề mặt hơi sần.

3. Kiểm tra khe hở thân vỏ
Khe hở giữa capo, cửa, cốp phải đều nhau. Khe lệch là dấu hiệu xe từng va chạm mạnh và phải cân chỉnh lại khung.

4. Dấu hiệu ngập nước
Ngửi mùi ẩm mốc trong khoang lái, kiểm tra dưới thảm sàn, trong hộc dự phòng và các đầu giắc điện xem có gỉ sét hay vệt bùn không.

5. Đối chiếu odo
So số km với độ mòn vô lăng, bàn đạp phanh, ghế lái. Xe 3 vạn km mà vô lăng bóng lì là chuyện không bình thường.

6. Lịch sử bảo dưỡng
Xe bảo dưỡng đủ tại hãng luôn có hồ sơ. Đây là căn cứ đáng tin hơn lời người bán rất nhiều.

7. Lái thử
Chạy tối thiểu 10km, đủ cả đường xấu và đường trường. Chú ý tiếng động lạ từ gầm, độ trễ hộp số và độ ăn của phanh.

Nếu không tự tin, hãy đưa xe tới garage độc lập kiểm tra. Chi phí khoảng 500.000đ nhưng có thể giúp bạn tránh mất hàng trăm triệu.`,
  },
  {
    title: "Xe cũ đời nào đáng mua nhất? Phân tích theo mức khấu hao",
    excerpt:
      "Xe mất giá mạnh nhất trong 3 năm đầu. Hiểu đường cong khấu hao giúp bạn mua đúng thời điểm giá trị nhất.",
    content: `Một chiếc xe phổ thông tại Việt Nam mất khoảng 10-15% giá trị ngay trong năm đầu tiên, và tiếp tục mất 7-10% mỗi năm sau đó. Sau năm thứ 5, tốc độ mất giá chậm lại rõ rệt.

Vùng giá trị tốt nhất: xe 3-5 năm tuổi
Ở mốc này xe đã qua giai đoạn mất giá mạnh nhất, nhưng vẫn còn mới về mặt kỹ thuật: động cơ chưa cần đại tu, nội thất còn đẹp, công nghệ chưa quá lạc hậu. Bạn mua được chiếc xe còn 80% chất lượng với 60% giá tiền.

Xe dưới 3 năm
Phù hợp với người muốn cảm giác gần như xe mới và còn bảo hành hãng. Đổi lại, chênh lệch với giá xe mới không nhiều nên lợi ích tài chính thấp.

Xe trên 7 năm
Giá rất mềm nhưng chi phí nuôi xe tăng: lốp, ắc quy, giảm xóc, hệ thống điện đều tới hạn thay thế. Chỉ nên mua nếu bạn có thợ quen và chấp nhận bảo dưỡng thường xuyên.

Lời khuyên: đặt ngân sách tổng gồm cả chi phí sửa chữa năm đầu, thường là 5-10% giá xe với xe trên 5 năm tuổi.`,
  },
  {
    title: "Thủ tục sang tên xe ô tô cũ 2026: hồ sơ, chi phí, thời gian",
    excerpt:
      "Danh sách giấy tờ cần chuẩn bị, các khoản phí phải nộp và thời gian xử lý khi sang tên xe ô tô đã qua sử dụng.",
    content: `Sang tên là bước bắt buộc để bạn trở thành chủ sở hữu hợp pháp. Bỏ qua bước này, mọi rủi ro pháp lý của xe vẫn thuộc về người đứng tên cũ, còn bạn thì không thể bán lại xe.

Hồ sơ cần chuẩn bị
- Giấy đăng ký xe bản gốc
- Giấy chứng nhận kiểm định còn hạn
- Hợp đồng mua bán công chứng
- CCCD của bên mua và bên bán
- Tờ khai lệ phí trước bạ

Các khoản phí
- Lệ phí trước bạ: 2% giá trị xe theo bảng giá tính thuế
- Phí đăng ký, cấp biển: tùy địa phương và loại biển
- Phí công chứng hợp đồng: theo giá trị giao dịch

Thời gian
Nộp hồ sơ tại cơ quan đăng ký nơi bạn thường trú. Thông thường nhận biển và đăng ký mới trong 2-7 ngày làm việc.

Lưu ý quan trọng
Nên hoàn tất sang tên trong vòng 30 ngày kể từ ngày ký hợp đồng mua bán để tránh bị xử phạt.`,
  },
  {
    title: "Trả góp mua xe ô tô cũ: lãi suất, điều kiện và cách tính khoản vay",
    excerpt:
      "Ngân hàng cho vay tới 70-80% giá trị xe cũ. Bài viết giải thích cách tính khoản trả hàng tháng và những bẫy lãi suất cần tránh.",
    content: `Phần lớn khách mua xe cũ hiện nay đều sử dụng vay ngân hàng. Hiểu rõ cấu trúc khoản vay giúp bạn không bị bất ngờ về sau.

Tỷ lệ cho vay
Xe cũ thường được duyệt vay 70-80% giá trị định giá, thời hạn 5-7 năm và xe không quá 10 năm tuổi tại thời điểm tất toán.

Hai cách tính lãi
- Lãi trên dư nợ giảm dần: tiền lãi tính trên số nợ còn lại, giảm dần theo thời gian. Đây là cách tính có lợi cho người vay.
- Lãi cố định trên số tiền gốc ban đầu: nghe thì thấp nhưng thực chất cao hơn đáng kể.

Ví dụ
Vay 500 triệu trong 5 năm, lãi suất 10%/năm trên dư nợ giảm dần: tháng đầu trả khoảng 12,5 triệu, các tháng sau giảm dần.

Cần hỏi trước khi ký
- Lãi suất sau thời gian ưu đãi là bao nhiêu
- Phí phạt trả nợ trước hạn
- Chi phí bảo hiểm vật chất bắt buộc kèm khoản vay

Chúng tôi hỗ trợ hồ sơ vay tại nhiều ngân hàng, tư vấn miễn phí và không thu phí dịch vụ.`,
  },
  {
    title: "Chi phí nuôi xe ô tô một năm tại TP.HCM gồm những gì?",
    excerpt:
      "Bảng chi phí thực tế: xăng, bảo hiểm, đăng kiểm, gửi xe, bảo dưỡng — để bạn tính đúng ngân sách trước khi mua.",
    content: `Nhiều người chỉ tính giá mua xe mà quên chi phí vận hành. Dưới đây là ước tính cho một chiếc sedan hạng B chạy khoảng 15.000 km/năm tại TP.HCM.

Nhiên liệu
Khoảng 7 lít/100km, tương đương 1.050 lít/năm. Chi phí xấp xỉ 22-25 triệu đồng.

Bảo hiểm
- Bắt buộc trách nhiệm dân sự: khoảng 500.000đ
- Vật chất tự nguyện: 1,3-1,6% giá trị xe

Đăng kiểm
Xe con dưới 9 chỗ: khoảng 300.000-400.000đ mỗi chu kỳ, cộng phí bảo trì đường bộ khoảng 1,56 triệu/năm.

Gửi xe
Chung cư nội thành khoảng 1,2-1,8 triệu/tháng, tức 15-20 triệu/năm. Đây thường là khoản bị bỏ sót nhiều nhất.

Bảo dưỡng
Thay dầu định kỳ mỗi 5.000-10.000km, cộng lốp và phanh theo chu kỳ: trung bình 8-12 triệu/năm.

Tổng cộng
Khoảng 55-70 triệu/năm, chưa tính khấu hao. Hãy cộng con số này vào kế hoạch tài chính trước khi quyết định mua.`,
  },
  {
    title: "Sedan, SUV hay MPV: chọn loại xe nào cho gia đình Việt?",
    excerpt:
      "So sánh ba dòng xe phổ biến nhất theo nhu cầu sử dụng thực tế: đô thị, đường dài, chở nhiều người.",
    content: `Không có dòng xe nào tốt nhất cho tất cả mọi người. Câu hỏi đúng là: bạn dùng xe cho việc gì nhiều nhất?

Sedan
Gầm thấp, vận hành êm, tiết kiệm nhiên liệu và dễ đỗ trong phố. Phù hợp với gia đình 4 người, chủ yếu di chuyển nội thành. Hạn chế: khó đi đường ngập hoặc đường xấu.

SUV / Crossover
Gầm cao, tầm nhìn thoáng, tự tin trên đường xấu và ngập nước. Đổi lại tốn nhiên liệu hơn và giá cao hơn ở cùng phân khúc. Phù hợp với người hay đi tỉnh.

MPV
Ưu tiên không gian: 7 chỗ thực dụng, cốp rộng, hàng ghế linh hoạt. Lựa chọn hợp lý cho gia đình nhiều thế hệ hoặc người chạy dịch vụ.

Gợi ý nhanh
- Chủ yếu đi làm trong phố, 4 người: sedan hạng B
- Hay về quê, đường xấu: crossover hạng B/C
- Gia đình 6-7 người: MPV
- Chạy dịch vụ: ưu tiên xe bền, phụ tùng rẻ, tiết kiệm nhiên liệu`,
  },
  {
    title: "Cách kiểm tra xe ô tô cũ có bị ngập nước hay không",
    excerpt:
      "Xe thủy kích là rủi ro lớn nhất khi mua xe cũ tại Việt Nam. Đây là những dấu hiệu người bán khó che giấu.",
    content: `Xe từng ngập nước có thể chạy bình thường vài tháng rồi phát sinh hàng loạt lỗi điện, mốc nội thất và gỉ sét khung gầm. Kiểm tra kỹ những điểm sau.

Mùi
Mở cửa xe đóng kín một lúc rồi ngửi. Mùi ẩm mốc hoặc mùi nước hoa xịt quá nồng đều đáng nghi.

Dưới thảm sàn
Lật thảm và tấm cách âm lên. Tìm vệt nước, bùn khô hoặc gỉ sét trên sàn kim loại.

Hộc để lốp dự phòng
Đây là điểm thấp nhất của xe và cũng là chỗ người bán hay quên vệ sinh. Có bùn hoặc gỉ là dấu hiệu rõ ràng.

Giắc điện và bulông
Kiểm tra các đầu giắc dưới ghế và trong khoang máy. Gỉ sét ở bulông ghế, ray trượt ghế là dấu hiệu nước từng dâng cao trong khoang lái.

Dây an toàn
Kéo hết dây an toàn ra. Đoạn cuối thường lưu lại vết nước hoặc mùi mốc.

Đèn pha
Hơi nước đọng bên trong chóa đèn kéo dài là dấu hiệu xe từng ngâm nước.

Nếu phát hiện từ hai dấu hiệu trở lên, hãy bỏ qua chiếc xe đó dù giá có hấp dẫn tới đâu.`,
  },
  {
    title: "Bảo dưỡng xe ô tô định kỳ: mốc km nào cần làm gì?",
    excerpt:
      "Lịch bảo dưỡng theo số km giúp xe bền, giữ giá và tránh những hỏng hóc lớn tốn kém.",
    content: `Bảo dưỡng đúng lịch là cách rẻ nhất để giữ xe bền và giữ giá khi bán lại.

Mỗi 5.000 km
Thay dầu máy và lọc dầu, kiểm tra áp suất lốp, nước làm mát, dầu phanh.

Mỗi 10.000 km
Đảo lốp, kiểm tra má phanh, vệ sinh lọc gió động cơ và lọc gió điều hòa.

Mỗi 20.000 km
Thay lọc gió động cơ, lọc gió điều hòa, kiểm tra hệ thống treo và các rotuyn.

Mỗi 40.000 km
Thay dầu hộp số, lọc nhiên liệu, bugi (với động cơ xăng thường), kiểm tra dây curoa.

Mỗi 80.000-100.000 km
Thay nước làm mát, dầu trợ lực, kiểm tra bơm nước và các gioăng phớt. Đây là mốc chi phí cao nhất trong đời xe.

Lưu ý: xe chạy nhiều trong phố, hay tắc đường nên rút ngắn chu kỳ khoảng 20% so với khuyến nghị của hãng.`,
  },
  {
    title: "Giá xe ô tô cũ được định như thế nào?",
    excerpt:
      "Cùng đời, cùng dòng nhưng giá chênh nhau cả trăm triệu. Đây là các yếu tố quyết định con số cuối cùng.",
    content: `Giá một chiếc xe cũ không chỉ phụ thuộc vào năm sản xuất. Dưới đây là các yếu tố ảnh hưởng mạnh nhất, xếp theo mức độ quan trọng.

1. Tình trạng khung vỏ
Xe zin nguyên bản, chưa từng va chạm luôn cao giá hơn xe đã sơn lại hoặc nắn khung, chênh lệch có thể lên tới 15-20%.

2. Số km đã đi
Odo thấp cộng hồ sơ bảo dưỡng đầy đủ là lợi thế lớn. Nhưng odo thấp mà không chứng minh được thì lại thành điểm trừ.

3. Đời chủ
Xe một chủ từ đầu luôn dễ bán hơn xe qua nhiều đời chủ.

4. Phiên bản và trang bị
Bản cao cấp giữ giá tốt hơn bản tiêu chuẩn, nhưng khoảng cách sẽ thu hẹp dần theo thời gian.

5. Màu sắc
Trắng, đen, bạc dễ bán nhất tại Việt Nam. Màu độc thường phải giảm giá để bán nhanh.

6. Thanh khoản của dòng xe
Những dòng phổ thông, phụ tùng rẻ luôn bán nhanh hơn xe hiếm dù chất lượng tương đương.

Chúng tôi định giá miễn phí xe của bạn dựa trên các tiêu chí trên và giá giao dịch thực tế trên thị trường.`,
  },
  {
    title: "Bán xe ô tô cũ nhanh và được giá: chuẩn bị thế nào?",
    excerpt:
      "Vài việc chuẩn bị đơn giản có thể giúp bạn bán nhanh hơn và tăng giá bán thêm vài chục triệu.",
    content: `Cùng một chiếc xe, cách chuẩn bị khác nhau có thể tạo chênh lệch lớn về giá và thời gian bán.

Chuẩn bị hồ sơ
Tập hợp đăng ký, đăng kiểm, bảo hiểm và toàn bộ hóa đơn bảo dưỡng. Bộ hồ sơ đầy đủ tạo niềm tin ngay từ đầu.

Vệ sinh kỹ
Rửa xe, hút bụi nội thất, đánh bóng sơn và làm sạch khoang máy. Chi phí vài trăm nghìn nhưng ảnh hưởng lớn tới ấn tượng đầu tiên.

Sửa những lỗi nhỏ
Bóng đèn cháy, cần gạt mưa mòn, lốp non hơi — người mua thường lấy đó làm cớ để ép giá mạnh hơn nhiều so với chi phí sửa.

Chụp ảnh đúng cách
Chụp ban ngày, đủ các góc: ngoại thất bốn phía, nội thất, taplo hiển thị odo, khoang máy và cốp. Ảnh thật, không chỉnh màu quá tay.

Đặt giá hợp lý
Khảo sát 5-10 xe cùng đời cùng dòng đang rao bán, rồi đặt giá sát mặt bằng. Giá quá cao khiến tin đăng bị bỏ qua ngay.

Ký gửi tại showroom
Nếu muốn bán nhanh mà không phải tiếp nhiều khách, ký gửi là lựa chọn hợp lý. Chúng tôi nhận ký gửi, hỗ trợ định giá và làm thủ tục sang tên trọn gói.`,
  },
];

async function main() {
  initializeApp({ credential: cert(JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, "utf8"))) });
  const db = getFirestore();

  // Dùng lại ảnh xe đang có làm ảnh bìa bài viết.
  const carSnap = await db.collection("cars").limit(30).get();
  const covers = carSnap.docs.map((d) => d.data().coverImage).filter(Boolean);

  const now = Date.now();
  for (const [i, post] of POSTS.entries()) {
    const slug = slugify(post.title, { lower: true, locale: "vi", strict: true });
    // Bài đầu danh sách là bài mới nhất; giãn mỗi bài cách nhau 1 ngày.
    const createdAt = now - i * 86_400_000;
    await db.collection("news").doc(slug).set({
      ...post,
      slug,
      coverImage: covers.length ? covers[i % covers.length] : "",
      isPublished: true,
      createdAt,
      updatedAt: createdAt,
    });
    console.log(`✓ ${post.title}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
