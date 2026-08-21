$images = @{
    "gdg.png" = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9GHDmt_uz87bJadw5lMFMYUAzAamB2FhJ_XML3ZAfiNLzEAOrHVK94esI&s=10"
    "gemma.png" = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN9oHAyZaI1nA8SJFFVOWtLpYi5nBkoCG6hQBHh74AWuGh_E9FGy6yv64&s=10"
    "kaggle.webp" = "https://logowik.com/content/uploads/images/kaggle4255.logowik.com.webp"
    "ieee.png" = "https://edu.ieee.org/in-reva/wp-content/uploads/sites/33/IEEE-CIS-logo-RGB-300ppi.png"
    "devfolio.png" = "https://cdn.iconscout.com/icon/free/png-256/free-devfolio-logo-icon-svg-download-png-1399882.png"
    "redbull.png" = "https://i.pinimg.com/originals/62/16/df/6216dff035f566b5ff43f2a4eac55f32.png"
    "msrit.png" = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGSxq2VcAtDEEVO0eWIlNZ9uHOnZIwrgXwkr86MaInmO5u8KYEAogrM24&s=10"
    "nexus.png" = "https://nexus.pk/wp-content/uploads/2023/12/SOC-INFOGRAPHIC.png"
    "aimobile.png" = "https://aimobilecoders.com/assets/aimobilecoder_logo_share.png"
    "enetopia.png" = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRITdZApg6aiSW3S8zxHmx6MYVMahY5CSzKB-6BLEs_yQ&s=10"
    "opensource.png" = "https://png.pngtree.com/png-vector/20221003/ourmid/pngtree-open-source-programming-png-image_6264096.png"
    "hackhere.jpeg" = "https://nexora-phi-ten.vercel.app/logo.jpeg"
}

foreach ($key in $images.Keys) {
    $url = $images[$key]
    $dest = "public/partners/$key"
    Write-Host "Downloading $key..."
    Invoke-WebRequest -Uri $url -OutFile $dest
}
Write-Host "Done!"
