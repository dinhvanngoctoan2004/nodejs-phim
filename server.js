// 1. Nhập thư viện express vào dự án
const express = require('express'); 

// 2. Khởi tạo một "app" (Đóng vai trò như một Nhà hàng)
const app = express(); 

// 3. Đặt cổng (port) cho server (Giống như số nhà để khách tìm đến)
const port = 3000; 

const mongoose = require('mongoose')

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/web_phim').then(()=>{
  console.log("ket noi mongodb thanh cong");
}).catch((err)=>{
  console.log("ket noi that bai loi:" +err);
})


const PhimSchema = new mongoose.Schema({
  ten: {type: String, required: true},
  TheLoai: {type:String, default:"chưa phan loai"},
  nam: Number
});

const phim = mongoose.model('phim',PhimSchema);

// 4. Tạo một API đầu tiên (Phương thức GET)
// Khi khách hàng (trình duyệt) vào đường dẫn gốc "/", ta gửi trả lại một câu chào 
app.get('/', (req, res) => {
  res.send('Xin chào thế giới! Server        ádf Node.js của tôi đã hoạt động! 🎉');
});


app.get('/api/phim',async (req,res)=>{
  try{
      const danhSachPhim= await phim.find();
      res.json({
          trangThai:"thanh cong",
          soLuong: danhSachPhim.length,
          duLieu: danhSachPhim
      });
    console.log("da tra ve phim");
  } catch(err){
    res.status(401).json({
      trangThai:"lay danh sach phim that bai",
      loi: err
    })
  }

})

app.post('/api/phim', async (req,res)=>{
  try{
    const PhimMoi = phim(req.body);
    await PhimMoi.save();
    res.status(200).json({
      trangThai:"them thanh cong",
      duLieu: PhimMoi
    })
    
  }catch(err){
    res.status(401).json({
      trangThai:"them that bai",
      loi: err
    })
  }
  
})

app.delete('/api/phim/:id',async (req,res)=>{
    try{
      const idCanXoa= req.params.id;
      const xoaPhim = await phim.findByIdAndDelete(idCanXoa);
      const danhSachPhim = await phim.find();
      if(!xoaPhim){
        res.json({
          loi: "khong tim thay id phim"
        })
      }
      res.json({
        trangThai:`da xoa ${idCanXoa}`,
        soLuong: danhSachPhim.length,
        duLieuXauXoa: danhSachPhim
    })
    console.log("da xoa phim");
    }catch(err){
      res.json({
        trangThai:"xoa that bai" +err,
      })
    }
})

app.put('/api/phim/:id', async(req,res)=>{
  try{
    const idCanCapNhat = req.params.id;
    const PhimCapNhat = await phim.findById(idCanCapNhat);
    // const duLieuMoi = req.body;
    // const phimDaSua = await Phim.findByIdAndUpdate(idCanSua, duLieuMoi, { new: true });

    if(!PhimCapNhat) return  res.json("khong tim thay phim");

    PhimCapNhat.ten= req.body.ten;
    PhimCapNhat.TheLoai= req.body.TheLoai;
    PhimCapNhat.nam = req.body.nam;
    await PhimCapNhat.save();

    const danhSachPhim = await phim.find();

    res.json({
      trangThai: "cap nhat thanh cong",
      phim: danhSachPhim

    })

  }catch(err){
    res.json("cap nhat that bai"+ err)
  }
})

// 5. Bật server lên và cho nó "lắng nghe" ở cổng 3000
app.listen(port, () => {
  console.log(`🚀 Server đang chạy ngon lành tại á: http://localhost:${port}`);
});