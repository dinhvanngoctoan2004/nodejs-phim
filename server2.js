const express = require('express');//bắt buộc 
const app= express(); //bắt buộc
const port =3000;// tạo cổng cho localhost
const mongoose = require('mongoose');///  thêm mongodb
const bcrypt = require('bcryptjs');// dùng để băm mật khẩu
const jwt = require('jsonwebtoken');////dùng để mã hóa token
const cors = require('cors');//// mở công cho froned
app.use(cors());/// mở cổng cho froned
app.use(express.json());


////kết nôi cơ sở dữ liệu
mongoose.connect('mongodb://localhost:27017/web_phim').then(()=>{
    console.log("ket noi co so du lieu thanh con 💚");
}).catch((err)=>{
    console.log("ket noi that bai ❤️:"+err);
})


///tạo khung để thêm dữ liệu
const NguoiDungSchema= new mongoose.Schema({
    taikhoan: {type:String, require:true, unique: true},
    matKhau: {type: String, require: true},
    vaiTro: {type:String, default:"hoc vien"}
})


/// quản lý để them dữ liệu
const NguoiDung = mongoose.model('NguoiDung', NguoiDungSchema);

// api đăng ký
app.post('/api/nguoiDung', async (req,res)=>{
    try{
        const {taikhoan, matKhau} = req.body;

        const ktTaiKhoang = await NguoiDung.findOne({taikhoan: taikhoan});

        if(ktTaiKhoang){
            return res.json("tai khoan da ton tai");
        }

        const giavi = await bcrypt.genSalt(10);
        const matKhauBam = await bcrypt.hash(matKhau,giavi);

        const nguoiDungMoi = new NguoiDung({
            taikhoan: taikhoan,
            matKhau: matKhauBam
        })

        await nguoiDungMoi.save();
        const danhSach = await NguoiDung.find();
        res.json({
            trangThai: "them thanh cong",
            duLieu: danhSach
        })

    }catch(err){
        res.json("dang ky that bai: "+err )
    }
})


//api đăng Nhập
app.post('/api/nguoiDung/dangnhap', async (req,res)=>{
    try{
        const {taikhoan, matKhau} = req.body;
        const ktTaiKhoan = await NguoiDung.findOne({taikhoan : taikhoan})
        if(!ktTaiKhoan) return res.json({trangThai: "tai khoan khong ton tai"});

        const matKhauDung= await bcrypt.compare(matKhau,ktTaiKhoan.matKhau);
        if(!matKhauDung) return  res.json({trangThai: "sai mat khau"});

        const theVip = jwt.sign(
            {id: ktTaiKhoan._id, vaiTro: ktTaiKhoan.vaiTro},
            "chi_khoa",
            {expiresIn:"1h"}
        );

        res.json({
            trangThai: "dang nhap thanh cong",
            token: theVip
        })
    }catch(err){
        res.json({
            trangThai: "dang nhap that bai " +err
        })
    }
})


/// xác thực token
const XacThuc = (req,res,next)=>{
    const token = req.header('Authorization');

    if(!token) return res.json({trangThai : "vui long dang nhap de su dung tinh nang"});

    try{
        const GiaiMa = jwt.verify(token,"chi_khoa");
        req.user = GiaiMa;
        next();
    }catch(err){
        res.json({trangThai:"vui long dang nhap de su dung tinh nang"})
    }
}


//// api xóa
app.delete('/api/nguoiDung/:id',XacThuc, async (req,res)=>{
    try{
        const nguoiDungCanXoa = req.params.id;
        const xoa= await NguoiDung.findByIdAndDelete(nguoiDungCanXoa);

        res.json({
            trangThai: "xoa thanh cong",
        })
    }catch(err){
        res.json({
            trangThai:"xoa that bai"
        })
    }
})


///////////////////////////////////
app.get('/api/nguoiDung', async (req, res)=>{
    try{
        const danhSach = await NguoiDung.find();
        res.json({
            soNguoiDung: danhSach.length,
            duLieu: danhSach
        })
    }catch(err){
        res.json("lay du lieu that bai: "+err)
    }
})


//// api cập nhật từng cái , app.put dung để cập nhật toàn bộ
app.patch('/api/nguoiDung/:id', async (req, res)=>{
    try{
        const idCanCapNhat = req.params.id;
        const UpDateNguoiDung = await NguoiDung.findById(idCanCapNhat);

        if(req.body.taikhoan)  UpDateNguoiDung.taikhoan = req.body.taikhoan;

        if(req.body.matKhau)  UpDateNguoiDung.matKhau = req.body.matKhau;
        
        if(req.body.vaiTro)  UpDateNguoiDung.vaiTro = req.body.vaiTro;

        await UpDateNguoiDung.save();

        res.json("cap nhat thanh cong");

    }catch(err){
        res.json("sua that bai: "+err)
    }
})

app.listen(port,()=>{
    console.log(`server dang chay tai :http://localhost:${port}`)
});

