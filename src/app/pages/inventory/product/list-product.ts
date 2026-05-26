import { Component, inject, signal, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TabsModule } from 'primeng/tabs';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customtable } from '@src/app/components/customTable/customtable';
import { ProductService } from '@src/app/services/product.service';
import { Product } from '@src/app/interfaces/product.interface';
import { BrandService } from '@src/app/services/brand.service';
import { CategoryService } from '@src/app/services/category.service';
import { SkuService } from '@src/app/services/sku.service';
import { AttributeService } from '@src/app/services/attribute.service';
import { Brand } from '@src/app/interfaces/brand.interface';
import { Category } from '@src/app/interfaces/category.interface';
import { SKU } from '@src/app/interfaces/sku.interface';
import { AttributeValue } from '@src/app/interfaces/attribute.interface';

@Component({
  selector: 'app-list-product',
  standalone: true,
  imports: [
    CommonModule, CardModule, ButtonModule, InputTextModule, DialogModule, 
    ReactiveFormsModule, ToggleButtonModule, TooltipModule, ToastModule, 
    ConfirmDialogModule, Customtable, SelectModule, TabsModule, InputNumberModule, MultiSelectModule, Checkbox
  ],
  templateUrl: './list-product.html'
})
export class ListProductComponent implements OnInit {
  @ViewChild('productTable') customTableComponent!: Customtable;

  public productService = inject(ProductService);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private skuService = inject(SkuService);
  private attrService = inject(AttributeService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  displayModal = signal<boolean>(false);
  displaySkuModal = signal<boolean>(false);
  displayEanModal = signal<boolean>(false);
  submitting = signal<boolean>(false);
  submittingSku = signal<boolean>(false);
  isEdit = signal<boolean>(false);

  products = signal<Product[]>([]);
  brands = signal<Brand[]>([]);
  categories = signal<Category[]>([]);
  attrValues = signal<AttributeValue[]>([]);
  skus = signal<SKU[]>([]);
  selectedProduct = signal<Product | null>(null);
  selectedSku = signal<SKU | null>(null);

  cols = [
    { field: 'name', header: 'Nombre', order: true, filter: true },
    { field: 'brand_name', header: 'Marca', order: true, filter: true },
    { field: 'category_name', header: 'Categoría', order: true, filter: true },
    { field: 'status', header: 'Estado', order: true, filter: true },
    { field: 'actions', header: 'Acciones', order: false, filter: false }
  ];

  form: FormGroup;
  skuForm: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      brand: [null],
      category: [null],
      status: [true]
    });

    this.skuForm = this.fb.group({
      id: [null],
      code: ['', Validators.required],
      name: ['', Validators.required],
      cost_price: [0, Validators.required],
      sell_price: [0, Validators.required],
      tax_exempt: [false],
      stock_min_override: [null],
      stock_max_override: [null],
      attribute_ids: [[]],
      status: [true]
    });
  }

  ngOnInit() {
    this.loadSelectData();
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts({rows: 1000}).subscribe(resp => {
        this.products.set(resp.results || resp);
    });
  }

  loadSelectData() {
    this.brandService.getBrands({ rows: 1000 }).subscribe(resp => this.brands.set(resp.results));
    this.categoryService.getCategories({ rows: 1000 }).subscribe(resp => this.categories.set(resp.results));
    this.attrService.getAttributeValues({ rows: 1000 }).subscribe(resp => this.attrValues.set(resp.results));
  }

  openSkuForm() {
    this.skuForm.reset({ cost_price: 0, sell_price: 0, tax_exempt: false, status: true, attribute_ids: [] });
    this.displaySkuModal.set(true);
  }

  editSku(sku: SKU) {
    this.skuForm.patchValue({
        ...sku,
        status: sku.status === '1',
        attribute_ids: sku.attribute_values?.map((av: any) => av.attribute_value) || []
    });
    this.displaySkuModal.set(true);
  }

  saveSku() {
    if (this.skuForm.invalid || !this.selectedProduct()) return;
    this.submittingSku.set(true);
    const skuData = { 
        ...this.skuForm.value, 
        product: this.selectedProduct()!.id,
        status: this.skuForm.value.status ? '1' : '0'
    };
    
    const request = skuData.id 
        ? this.skuService.updateSku(skuData)
        : this.skuService.createSku(skuData);

    request.subscribe({
      next: () => {
        this.displaySkuModal.set(false);
        this.submittingSku.set(false);
        this.loadSkus();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'SKU guardado' });
      },
      error: () => this.submittingSku.set(false)
    });
  }

  openNew() {
    this.isEdit.set(false);
    this.selectedProduct.set(null);
    this.skus.set([]); 
    this.form.reset({ status: true });
    this.displayModal.set(true);
  }

  editProduct(product: Product) {
    this.isEdit.set(true);
    this.selectedProduct.set(product);
    this.form.patchValue({
      ...product,
      status: product.status === '1'
    });
    this.skuService.getSkusByProduct(product.id).subscribe(resp => {
        this.skus.set(Array.isArray(resp) ? resp : (resp.results || []));
    });
    this.displayModal.set(true);
  }

  save() {
    if (this.form.invalid) return;

    this.submitting.set(true);
    const formValue = this.form.value;
    const productData: Product = {
      ...formValue,
      status: formValue.status ? '1' : '0'
    };
    
    const request = this.isEdit() 
      ? this.productService.updateProduct(productData)
      : this.productService.createProduct(productData);

    request.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto guardado' });
        this.displayModal.set(false);
        this.submitting.set(false);
        this.refreshTable();
      },
      error: () => {
        this.submitting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar' });
      }
    });
  }

  confirmDelete(product: Product) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar el producto "${product.name}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.productService.deleteProduct(product.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Producto borrado' });
          this.refreshTable();
        });
      }
    });
  }

  deleteSku(sku: SKU) {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar la variante "${sku.code}"?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.skuService.deleteSku(sku.id!).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'SKU borrado' });
          this.loadSkus();
        });
      }
    });
  }

  private loadSkus() {
    if(this.selectedProduct()) {
      this.skuService.getSkusByProduct(this.selectedProduct()?.id).subscribe(resp => {
        const data = Array.isArray(resp) ? resp : (resp.results || []);
        this.skus.set(data as SKU[]);
      });
    }
  }

  refreshTable() {
    if (this.customTableComponent) {
      this.customTableComponent.onRefresh();
    }
  }

  openEanModal(sku: SKU) {
    this.selectedSku.set(sku);
    this.displayEanModal.set(true);
  }

  addEan(input: HTMLInputElement) {
    if (!input.value || !this.selectedSku()) return;
    this.skuService.createEan({ sku: this.selectedSku()!.id!, code: input.value, is_main: false }).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'EAN agregado' });
        input.value = '';
        this.loadSkusWithUpdate(this.selectedSku()!.id!);
    });
  }

  deleteEan(ean: any) {
    this.skuService.deleteEan(ean.id).subscribe(() => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'EAN borrado' });
        this.loadSkusWithUpdate(this.selectedSku()!.id!);
    });
  }

  private loadSkusWithUpdate(skuId: number | string) {
    this.loadSkus();
    this.skuService.getSkusByProduct(this.selectedProduct()?.id).subscribe(resp => {
        const skus = Array.isArray(resp) ? resp : (resp.results || []);
        const updatedSku = skus.find((s: SKU) => s.id === skuId);
        if (updatedSku) this.selectedSku.set(updatedSku);
    });
  }
}
